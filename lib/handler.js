import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsPath = path.join(__dirname, "../commands");

export async function loadCommands() {
  const commands = new Map();

  if (!fs.existsSync(commandsPath)) {
    console.warn("⚠️ Folder commands tidak ditemukan, membuat folder...");
    fs.mkdirSync(commandsPath);
  }

  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    try {
      const { default: command } = await import(
        `../commands/${file}?update=${Date.now()}`
      );
      if (!command || !command.name || !command.execute) {
        console.warn(`⚠️ Command ${file} tidak valid (lewatkan).`);
        continue;
      }
      commands.set(command.name.toLowerCase(), command);
      console.log(`✅ Loaded command: ${command.name}`);
    } catch (err) {
      console.error(`❌ Gagal load command ${file}:`, err);
    }
  }

  return commands;
}

export function watchCommands(onReload) {
  fs.watch(commandsPath, { recursive: false }, async (eventType, filename) => {
    if (filename && filename.endsWith(".js")) {
      console.log(`🔄 Detected change in ${filename}, reloading commands...`);
      try {
        const newCommands = await loadCommands();
        onReload(newCommands);
        console.log("✅ Commands reloaded successfully.");
      } catch (e) {
        console.error("❌ Gagal reload commands:", e);
      }
    }
  });
}