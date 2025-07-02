import fs from "fs";

const DB_PATH = "./data/products.json";

export default {
  name: "shop",
  aliases: ["toko", "warung", "produk"],
  description: "Menampilkan katalog produk",
  async execute(sock, { from, msg }) {
    let raw = "{}";
    try {
      raw = fs.readFileSync(DB_PATH);
    } catch (e) {
      console.error("❌ Gagal baca products.json:", e);
    }
    const db = JSON.parse(raw);

    const keys = Object.keys(db);
    if (keys.length === 0) {
      return sock.sendMessage(from, {
        text: "📦 Belum ada produk di katalog."
      });
    }

    let text = `🛒 *Katalog Produk*\n\n`;
    for (const key of keys) {
      const item = db[key];
      text += `• *${item.name}*\n`;
      text += `  💰 Rp${item.price}\n`;
      text += `  📄 ${item.desc}\n\n`;
    }

    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};