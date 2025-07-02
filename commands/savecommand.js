// VERSI LENGKAP YA GUYS YA 😄
import fs from 'fs'
import path from 'path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const DB_PATH = './data/custom_commands.json'
const MEDIA_DIR = './data/media'

// Pastikan folder & file ada
if (!fs.existsSync('./data')) fs.mkdirSync('./data')
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}')
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR)

export default {
  name: 'savecommand',
  async execute(sock, { from, msg, text }) {
    // Hapus awalan 'savecommand' atau '.savecommand'
    const commandBody = text.replace(/^\.?savecommand\s*/i, '')
    const [rawKey, ...rest] = commandBody.split('=>')
    const key = rawKey?.trim().toLowerCase()
    const caption = rest.join('=>').trim()

    if (!key || !caption) {
      return sock.sendMessage(from, {
        text: '❌ Format salah!\n\nContoh:\nsavecommand hai => Halo juga!'
      })
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH))
    const mediaMessage =
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.stickerMessage ||
      msg.message?.audioMessage

    let mediaType = null
    let fileName = null

    // Jika ada media
    if (mediaMessage) {
      mediaType = Object.keys(msg.message)[0]
      const extensionMap = {
        imageMessage: 'jpg',
        videoMessage: 'mp4',
        stickerMessage: 'webp',
        audioMessage: 'mp3'
      }
      const ext = extensionMap[mediaType] || 'bin'

      try {
        const buffer = await downloadMediaMessage(
          msg,
          'buffer',
          {},
          {
            logger: sock.logger,
            reuploadRequest: sock.updateMediaMessage
          }
        )

        fileName = `${key}_${Date.now()}.${ext}`
        const filePath = path.join(MEDIA_DIR, fileName)
        fs.writeFileSync(filePath, buffer)
      } catch (e) {
        console.error('❌ Gagal download media:', e)
        return sock.sendMessage(from, {
          text: '❌ Gagal menyimpan media. Coba ulangi.'
        })
      }
    }

    // Simpan ke database
    db[key] = {
      text: caption,
      media: fileName || null,
      type: mediaType || null
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
    await sock.sendMessage(from, {
      text: `✅ Command '${key}' berhasil disimpan!`
    })
  }
}


/*import fs from 'fs'
const DB_PATH = './data/custom_commands.json'

if (!fs.existsSync('./data')) fs.mkdirSync('./data')
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}')

export default {
  name: 'savecommand',
  async execute(sock, { from, msg, text }) {
    const split = text.split('=>')
    if (split.length < 2) {
      return sock.sendMessage(from, { text: 'Format salah! Contoh: .savecommand ucapan => Halo semua!' })
    }

    const key = split[0].replace('.savecommand', '').trim()
    const value = split[1].trim()

    const raw = fs.readFileSync(DB_PATH)
    const db = JSON.parse(raw)

    db[key.toLowerCase()] = value
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))

    await sock.sendMessage(from, { text: `✅ Command '${key}' berhasil disimpan!` })
  }
}*/