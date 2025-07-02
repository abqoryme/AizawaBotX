import fs from "fs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const DB_PATH = "./data/quiz.json";
let currentQuestion = null;

export function startDailyQuiz(sock, groupJid) {
  setInterval(async () => {
    const now = dayjs().tz("Asia/Jakarta");
    const current = now.format("HH:mm");
    if (current === "18:15") {
      const data = JSON.parse(fs.readFileSync(DB_PATH));
      const random = data[Math.floor(Math.random() * data.length)];
      currentQuestion = random;

      await sock.sendMessage(groupJid, {
        text: `🧩 *Quiz Harian*\n\n${random.question}\n\nSilakan jawab cepat!`
      });
    }
  }, 60 * 1000);
}

export function handleQuizAnswer(sock, msg) {
  if (!currentQuestion) return;

  const answer = msg.message?.conversation?.trim().toLowerCase();
  if (answer === currentQuestion.answer.toLowerCase()) {
    sock.sendMessage(msg.key.remoteJid, {
      text: `🎉 Jawaban benar! *${currentQuestion.answer}*`
    }, { quoted: msg });
    currentQuestion = null;
  }
}