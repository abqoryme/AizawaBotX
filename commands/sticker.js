import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "sticker",
  description: "Mengubah foto/video pendek menjadi stiker dengan watermark",
  async execute(sock, { from, msg }) {
    const quoted = msg.quoted || msg;
    const mime =
      quoted.message?.imageMessage ||
      quoted.message?.videoMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage;

    if (!mime) {
      return sock.sendMessage(from, {
        text: "❌ Kirim gambar/video pendek dengan caption *sticker* atau balas media dengan *sticker*"
      });
    }

    try {
      // download media
      const buffer = await downloadMediaMessage(quoted, "buffer", {}, {
        logger: sock.logger,
        reuploadRequest: sock.updateMediaMessage
      });

      const tmpInput = path.join(__dirname, `../tmp/tmp_${Date.now()}.input`);
      const tmpOutput = tmpInput.replace(".input", ".webp");

      fs.writeFileSync(tmpInput, buffer);

      ffmpeg.setFfmpegPath(ffmpegPath);

      await new Promise((resolve, reject) => {
        ffmpeg(tmpInput)
          .outputOptions([
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
            "-loop 0",
            "-preset default",
            "-an",
            "-vsync 0"
          ])
          .save(tmpOutput)
          .on("end", resolve)
          .on("error", reject);
      });

      const stickerBuffer = fs.readFileSync(tmpOutput);

      await sock.sendMessage(
        from,
        {
          sticker: stickerBuffer,
          //packname: "ChouBot",
          //author: "choubot.dev"
        },
        { quoted: msg }
      );

      fs.unlinkSync(tmpInput);
      fs.unlinkSync(tmpOutput);
    } catch (e) {
      console.error("❌ Gagal membuat stiker:", e);
      await sock.sendMessage(from, {
        text: "❌ Gagal membuat stiker, pastikan file valid."
      });
    }
  }
};