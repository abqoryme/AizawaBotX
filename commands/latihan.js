import fs from "fs";

global.currentExercise = null;

export default {
  name: "latihan",
  description: "Latihan bahasa Inggris dasar",
  async execute(sock, { from, msg }) {
    const data = JSON.parse(fs.readFileSync("./data/english_quiz.json"));
    if (!global.currentExercise) {
      global.currentExercise = data[Math.floor(Math.random() * data.length)];
      await sock.sendMessage(from, {
        text: `📝 *Latihan Bahasa*\n\n${global.currentExercise.q}`
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        text: `Kamu belum jawab soal sebelumnya!\n\n${global.currentExercise.q}`
      }, { quoted: msg });
    }
  }
};