import fs from "fs";
const DB_PATH = "./data/habit.json";

export default {
  name: "sethabit",
  aliases: ["habit", "sethabit", "pengingat"],
  description: "Set pengingat kebiasaan rutin",
  async execute(sock, { from, msg, text, sender }) {
    const args = text.split(" ").slice(1).join(" ").trim();
    const match = args.match(/(.+)\s+jam\s+(\d{2}:\d{2})/i);

    if (!match) {
      return sock.sendMessage(from, {
        text: "❌ Format salah!\nContoh:\n.sethabit push-up jam 06:00"
      });
    }

    const [_, habit, time] = match;

    let db = [];
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH));
    }

    db.push({
      user: sender,
      habit: habit.trim(),
      time
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    await sock.sendMessage(from, {
      text: `✅ Pengingat untuk *${habit}* di jam *${time}* sudah disimpan.`
    }, { quoted: msg });
  }
};