import chalk from "chalk";

export function logMessage({ from, sender, text }) {
  const time = new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
  console.log(
    chalk.bgBlueBright.white.bold(` [${time}] PESAN `),
    chalk.cyan(`from: ${from}`),
    chalk.green(`sender: ${sender}`),
    chalk.yellow(`text: ${text}`)
  );
}