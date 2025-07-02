import fs from "fs";
const PRODUCTS_DB = "./data/products.json";
const ORDERS_DB = "./data/orders.json";

export default {
  name: "buy",
  description: "Membeli produk dari katalog",
  async execute(sock, { from, msg, text, sender }) {
    const args = text.split(" ").slice(1).join(" ").trim();

    if (!args) {
      return sock.sendMessage(from, {
        text: "❌ Format salah!\nContoh: .buy NamaProduk"
      });
    }

    // load produk
    let products = {};
    try {
      products = JSON.parse(fs.readFileSync(PRODUCTS_DB));
    } catch (e) {
      console.error("❌ Gagal baca products.json:", e);
    }

    // cari produk
    const found = Object.values(products).find(
      p => p.name.toLowerCase() === args.toLowerCase()
    );

    if (!found) {
      return sock.sendMessage(from, {
        text: `❌ Produk *${args}* tidak ditemukan di katalog.`
      });
    }

    // load orders
    let orders = [];
    try {
      orders = JSON.parse(fs.readFileSync(ORDERS_DB));
    } catch (e) {
      console.error("❌ Gagal baca orders.json:", e);
    }

    // buat order
    const orderId = `ORD${Date.now()}`;
    const invoiceUrl = `https://mybot.shop/invoice/${orderId}`; // dummy
    const newOrder = {
      orderId,
      user: sender,
      product: found.name,
      price: found.price,
      status: "pending",
      invoiceUrl,
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    fs.writeFileSync(ORDERS_DB, JSON.stringify(orders, null, 2));

    await sock.sendMessage(from, {
      text: `✅ Pesanan *${found.name}* diterima!\n
💰 Harga: Rp${found.price}
🧾 Invoice: ${invoiceUrl}
Status: *pending*\n
Silakan segera lakukan pembayaran.`
    }, { quoted: msg });

    // kirim notifikasi ke owner
    const OWNER = "628xxxx@s.whatsapp.net"; // ganti nomor kamu
    await sock.sendMessage(OWNER, {
      text: `📦 *Order Masuk*\n\nUser: wa.me/${sender.split("@")[0]}\nProduk: ${found.name}\nHarga: Rp${found.price}\nOrderID: ${orderId}`
    });
  }
};