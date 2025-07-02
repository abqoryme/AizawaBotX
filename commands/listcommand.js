import fs from "fs";

const DB_PATH = "./data/custom_commands.json";

export default {
  name: "listcommand",
  description: "Menampilkan semua custom command yang tersimpan",
  async execute(sock, { from, msg }) {
    try {
      const raw = fs.readFileSync(DB_PATH);
      const db = JSON.parse(raw);

      const keys = Object.keys(db);
      if (keys.length === 0) {
        return sock.sendMessage(from, {
          text: "ℹ️ Belum ada custom command yang tersimpan."
        });
      }

      let text = `📋 *Daftar Custom Command:*\n\n`;
      for (const key of keys) {
        const item = db[key];
        const hasMedia = item.media ? ` (📎 media: ${item.media})` : "";
        text += `• ${key}${hasMedia}\n`;
      }

      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
      console.error("❌ Gagal membaca database custom_commands.json:", e);
      await sock.sendMessage(from, {
        text: "❌ Terjadi error saat membaca daftar command."
      });
    }
  }
};