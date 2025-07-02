import axios from "axios";
import FormData from "form-data";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

async function Uguu(buffer, filename) {
  const form = new FormData();
  form.append("files[]", buffer, { filename });

  const { data } = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
  });

  if (data.files && data.files[0]) {
    return data.files[0].url;
  } else {
    throw new Error("Gagal upload ke uguu.se, coba lagi nanti.");
  }
}

export default {
  name: "hitamkan",
  aliases: ["black", "dark"],
  description: "Mengubah gambar menjadi hitam putih",
  async execute(sock, { from, msg }) {
    try {
      const q = msg.quoted || msg;
      const mime =
        q.message?.imageMessage?.mimetype ||
        q.message?.documentMessage?.mimetype;

      if (!mime || !mime.startsWith("image/")) {
        return sock.sendMessage(from, {
          text: "❌ Silakan kirim atau balas gambar yang ingin dihitamkan.",
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { text: "⏳ Tunggu sebentar..." }, { quoted: msg });

      const mediaBuffer = await downloadMediaMessage(q, "buffer", {}, {
        logger: sock.logger,
        reuploadRequest: sock.updateMediaMessage,
      });

      const filename = `image_${Date.now()}.jpg`;
      const imageUrl = await Uguu(mediaBuffer, filename);

      const response = await axios.get(
        `https://zenzxz.dpdns.org/tools/hitamkan?imageUrl=${encodeURIComponent(imageUrl)}`,
        { responseType: "arraybuffer" }
      );

      await sock.sendMessage(from, {
        image: Buffer.from(response.data),
        caption: "✅ Ini gambarnya sudah dihitamkan.",
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Error hitamkan:", err);
      await sock.sendMessage(from, {
        text: typeof err === "string" ? err : (err.message || "❌ Terjadi error memproses gambar."),
      }, { quoted: msg });
    }
  }
};