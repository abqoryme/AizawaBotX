import fs from 'fs'
import path from 'path'
import { loadCommands } from '../lib/handler.js'
import { OWNER_NUMBERS } from '../config.js'

const PLUGIN_DIR = './commands'

export default {
  name: 'delplugin',
  async execute(sock, { from, msg, text, sender }) {
    if (!OWNER_NUMBERS.includes(sender)) {
      return sock.sendMessage(from, { text: '❌ Hanya owner yang boleh menggunakan perintah ini.' })
    }

    const pluginName = text.replace(/^\.?delplugin\s*/i, '').trim().toLowerCase()
    if (!pluginName) {
      return sock.sendMessage(from, {
        text: '❌ Format salah!\n\nContoh:\ndelplugin ping'
      })
    }

    const filePath = path.join(PLUGIN_DIR, `${pluginName}.js`)
    if (!fs.existsSync(filePath)) {
      return sock.sendMessage(from, {
        text: `❌ Plugin '${pluginName}' tidak ditemukan.`
      })
    }

    try {
      fs.unlinkSync(filePath) // hapus file plugin
      global.COMMANDS = await loadCommands() // reload daftar command
      await sock.sendMessage(from, {
        text: `🗑️ Plugin '${pluginName}' berhasil dihapus dan daftar command dimuat ulang.`
      })
    } catch (e) {
      await sock.sendMessage(from, {
        text: `❌ Gagal menghapus plugin:\n${e.message}`
      })
    }
  }
}