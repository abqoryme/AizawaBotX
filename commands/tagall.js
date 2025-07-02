const cooldown = new Map(); // memory cooldown per grup

export default {
  name: "tagall",
  description: "Mention semua anggota grup (dengan custom auto delete)",
  async execute(sock, { from, msg, groupMetadata, isAdmin, text }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, {
        text: "❌ Perintah ini hanya bisa dipakai di grup."
      });
    }

    if (!isAdmin) {
      return sock.sendMessage(from, {
        text: "❌ Kamu harus admin untuk tagall."
      });
    }

    // cek cooldown
    const last = cooldown.get(from) || 0;
    const now = Date.now();
    if (now - last < 30_000) {
      return sock.sendMessage(from, {
        text: "⏳ Tagall sedang cooldown 30 detik. Sabar dulu."
      });
    }
    cooldown.set(from, now);

    try {
      const participants = groupMetadata.participants;
      const mentions = participants.map(p => p.id);

      // cek apakah ada angka di awal teks
      const args = text.split(" ").slice(1); // tanpa .tagall
      let delay = 15; // default 15 detik
      let extra = args.join(" ");

      if (args.length > 0 && /^\d+detik$/i.test(args[0])) {
  delay = parseInt(args[0]);
  if (isNaN(delay)) delay = 15; // fallback default
  if (delay !== 0 && delay < 5) delay = 5; // minimal 5 detik kecuali memang 0
  extra = args.slice(1).join(" ");
}

      const mentionList = participants
        .map((p, idx) => `${idx + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      const pesan = `📢 *Tag Semua Anggota:*\n\n${mentionList}\n\n${extra || ""}`;

      const sent = await sock.sendMessage(from, {
        text: pesan,
        mentions
      }, { quoted: msg });

      // jika 0detik → tidak dihapus
      if (delay !== 0) {
        setTimeout(() => {
          sock.sendMessage(from, {
            delete: sent.key
          });
        }, delay * 1000);
      }

    } catch (e) {
      console.error("❌ Error tagall:", e);
      await sock.sendMessage(from, {
        text: "❌ Terjadi error saat tagall."
      });
    }
  }
};