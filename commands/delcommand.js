import fs from 'fs'
import path from 'path'

const DB_PATH = './data/custom_commands.json'
const MEDIA_DIR = './data/media'

export default {
  name: 'delcommand',
  async execute(sock, { from, text }) {
    // Mendukung nama command multi-kata
    const name = text.split(' ').slice(1).join(' ').toLowerCase().trim()
    if (!name) {
      return sock.sendMessage(from, {
        text: '❌ Format: delcommand namanya'
      })
    }

    const raw = fs.readFileSync(DB_PATH)
    const db = JSON.parse(raw)

    if (!db[name]) {
      return sock.sendMessage(from, {
        text: '❌ Command tidak ditemukan!'
      })
    }

    // cek apakah command punya media
    if (db[name].media) {
      const filePath = path.join(MEDIA_DIR, db[name].media)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Media file ${filePath} dihapus.`)
      }
    }

    // hapus di database
    delete db[name]
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))

    await sock.sendMessage(from, {
      text: `✅ Command '${name}' dihapus.`
    })
  }
}