import fs from "fs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const DB_PATH = "./data/habit.json";

export function startHabitReminder(sock) {
  setInterval(() => {
    if (!fs.existsSync(DB_PATH)) return;

    const db = JSON.parse(fs.readFileSync(DB_PATH));
    const now = dayjs().tz("Asia/Jakarta");
    const current = now.format("HH:mm");

    db.forEach(async (entry) => {
      if (entry.time === current) {
        await sock.sendMessage(entry.user, {
          text: `📢 Saatnya *${entry.habit}*!\nSemangat terus 💪`
        });
      }
    });
  }, 60 * 1000); // cek tiap menit
}