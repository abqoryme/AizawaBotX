import fs from "fs";
const DB_PATH = "./data/products.json";

export default {
  name: "addproduct",
  description: "Menambahkan produk ke katalog (hanya admin)",
  async execute(sock, { from, msg, text, isAdmin }) {

    const args = text.split(" ").slice(1).join(" ");
    const [name, priceStr, desc] = args.split("|").map(s => s.trim());

    if (!name || !priceStr || !desc) {
      return sock.sendMessage(from, {
        text: "❌ Format salah!\nContoh:\n.addproduct Nama | harga | deskripsi"
      });
    }

    const price = parseInt(priceStr);
    if (isNaN(price)) {
      return sock.sendMessage(from, {
        text: "❌ Harga harus berupa angka."
      });
    }

    let raw = "{}";
    try {
      raw = fs.readFileSync(DB_PATH);
    } catch (e) {
      console.error("❌ Gagal baca products.json:", e);
    }
    const db = JSON.parse(raw);

    const id = `p${Date.now()}`;
    db[id] = { name, price, desc };

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    await sock.sendMessage(from, {
      text: `✅ Produk *${name}* berhasil ditambahkan ke katalog.`
    }, { quoted: msg });
  }
};