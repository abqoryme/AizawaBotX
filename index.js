/**
 * Bot WhatsApp by Chou
 * Versi: 0.0.2 (refactor)
 */

/**
 * Bot WhatsApp by Chou
 * Versi: 0.0.3 (refactor + quiz + habit)
 */

import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys";
import P from "pino";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Boom } from "@hapi/boom";
import { loadCommands, watchCommands } from "./lib/handler.js";
import { startHabitReminder } from "./habitRunner.js";
import { startDailyQuiz, handleQuizAnswer } from "./quiz.js";
import { logMessage } from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startSock = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    // load commands
    global.COMMANDS = await loadCommands();
    watchCommands((newCommands) => {
      global.COMMANDS = newCommands;
    });

    // start habit reminder
    startHabitReminder(sock);

    // start daily quiz
    const quizGroup = "120363418706833918@g.us"; // GANTI dengan grup JID kamu
    startDailyQuiz(sock, quizGroup);

    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
       /* connsole.log("\n========== PESAN MASUK ==========");
        console.dir(msg.message, { depth: null });
        console.log("==================================\n");*/

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        let rawText =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          msg.message.buttonsResponseMessage?.selectedButtonId ||
          msg.message.templateButtonReplyMessage?.selectedId ||
          msg.message.listResponseMessage?.singleSelectReply?.selectedRowId;

        if (
          !rawText &&
          msg.message.interactiveResponseMessage?.nativeFlowResponseMessage
            ?.paramsJson
        ) {
          try {
            const params = JSON.parse(
              msg.message.interactiveResponseMessage.nativeFlowResponseMessage
                .paramsJson
            );
            rawText = params.id;
          } catch (e) {
            console.error("❌ Gagal parse nativeFlow paramsJson:", e);
          }
        }

        const text = (rawText || "").trim();
        const commandName = text.split(" ")[0]?.toLowerCase();
        //logger
        logMessage({ from, sender, text });

        const command = [...global.COMMANDS.values()].find(
          (cmd) =>
            cmd.name === commandName ||
            (cmd.aliases && cmd.aliases.includes(commandName))
        );

        const groupMetadata = from.endsWith("@g.us")
          ? await sock.groupMetadata(from)
          : null;

        const isAdmin = groupMetadata
          ? groupMetadata.participants.some((p) => p.id === sender && p.admin)
          : false;

        // fallback custom command
        let customCmd;
        try {
          const raw = fs.readFileSync("./data/custom_commands.json");
          const custom = JSON.parse(raw);
          const key = text.toLowerCase();
          customCmd = custom[key];
        } catch (e) {
          console.error("❌ Gagal membaca custom_commands.json:", e);
        }

        if (customCmd) {
          if (typeof customCmd === "string") {
            await sock.sendMessage(from, { text: customCmd }, { quoted: msg });
          } else if (typeof customCmd === "object" && customCmd.text) {
            if (customCmd.media) {
              const filePath = `./data/media/${customCmd.media}`;
              const mediaType = customCmd.type?.replace("Message", "");
              await sock.sendMessage(
                from,
                {
                  [mediaType]: fs.readFileSync(filePath),
                  caption: customCmd.text
                },
                { quoted: msg }
              );
            } else {
              await sock.sendMessage(from, { text: customCmd.text }, { quoted: msg });
            }
          }
          return;
        }

        // jika plugin command
        if (command) {
          await command.execute(sock, {
            from,
            msg,
            text,
            sender,
            isAdmin,
            groupMetadata
          });
        }
        //latihan
         if (
  global.currentExercise &&
  text.toLowerCase() === global.currentExercise.a.toLowerCase()
) {
  await sock.sendMessage(from, {
    text: `✅ Benar! *${global.currentExercise.a}*`
  });
  global.currentExercise = null;
}
        // quiz answer handler
        handleQuizAnswer(sock, msg);
      } catch (err) {
        console.error("❌ Error di messages.upsert:", err);
      }
    });

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log("❌ Disconnected with reason:", reason);
        if (reason !== DisconnectReason.loggedOut) {
          startSock(); // auto reconnect
        } else {
          console.log("❌ Session logged out, silakan scan ulang QR.");
        }
      }
    });

    console.log("✅ Bot Chou sudah aktif dan stabil!");
  } catch (err) {
    console.error("❌ Fatal error di startSock:", err);
  }
};

startSock();

/*import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import P from "pino";
import fs from "fs";
import { loadCommands } from "./lib/handler.js";
import { watchCommands } from "./lib/handler.js";

const startSock = async () => {
  try {
    // multi-file auth
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    // load commands
    global.COMMANDS = await loadCommands();
    watchCommands((newCommands) => {
  global.COMMANDS = newCommands;
});

    // pesan masuk
    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        console.log("\n========== PESAN MASUK ==========");
        console.dir(msg.message, { depth: null });
        console.log("==================================\n");

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        let rawText =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          msg.message.buttonsResponseMessage?.selectedButtonId ||
          msg.message.templateButtonReplyMessage?.selectedId ||
          msg.message.listResponseMessage?.singleSelectReply?.selectedRowId;

        if (
          !rawText &&
          msg.message.interactiveResponseMessage?.nativeFlowResponseMessage
            ?.paramsJson
        ) {
          try {
            const params = JSON.parse(
              msg.message.interactiveResponseMessage.nativeFlowResponseMessage
                .paramsJson
            );
            rawText = params.id;
          } catch (e) {
            console.error("❌ Gagal parse nativeFlow paramsJson:", e);
          }
        }

        const text = String(rawText || "").trim();
        const commandName = text.split(" ")[0]?.toLowerCase();

        const command = [...global.COMMANDS.values()].find(
  cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))
);

        console.log("Isi text:", text);
        console.log("Semua command:", [...global.COMMANDS.keys()]);

        const groupMetadata = from.endsWith("@g.us")
          ? await sock.groupMetadata(from)
          : null;

        const isAdmin = groupMetadata
          ? groupMetadata.participants.find((p) => p.id === sender)?.admin !=
            null
          : false;

        // fallback custom command (dari JSON)
        let customCmd;
        try {
          const raw = fs.readFileSync("./data/custom_commands.json");
          const custom = JSON.parse(raw);
          const key = text.toLowerCase();
          customCmd = custom[key];
        } catch (e) {
          console.error("❌ Gagal membaca custom_commands.json:", e);
          customCmd = null;
        }

        if (customCmd) {
          if (typeof customCmd === "string") {
            await sock.sendMessage(from, { text: customCmd }, { quoted: msg });
          } else if (typeof customCmd === "object" && customCmd.text) {
            if (customCmd.media) {
              const filePath = "./data/media/" + customCmd.media;
              const mediaType = customCmd.type?.replace("Message", "");
              await sock.sendMessage(
                from,
                {
                  [mediaType]: fs.readFileSync(filePath),
                  caption: customCmd.text
                },
                { quoted: msg }
              );
            } else {
              await sock.sendMessage(
                from,
                { text: customCmd.text },
                { quoted: msg }
              );
            }
          }
          return;
        }

        // jika command plugin ada
        if (command) {
          await command.execute(sock, {
            from,
            msg,
            text,
            sender,
            isAdmin,
            groupMetadata
          });
        }
      } catch (err) {
        console.error("❌ Error di handler messages.upsert:", err);
      }
    });
  } catch (err) {
    console.error("❌ Error saat startSock:", err);
  }
};

startSock();*/