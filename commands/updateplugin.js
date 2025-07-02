import fs from 'fs'
import path from 'path'
import { loadCommands } from '../lib/handler.js'
import { OWNER_NUMBERS } from '../config.js'

const PLUGIN_DIR = './commands'

export default {
  name: 'updateplugin',
  async execute(sock, { from, msg, text, sender }) {
    if (!OWNER_NUMBERS.includes(sender)) {
      return sock.sendMessage(from, { text: '❌ Hanya owner yang boleh menggunakan perintah ini.' })
    }

    const [cmd, ...rawCode] = text.replace(/^\.?updateplugin\s*/i, '').split('=>')
    const name = cmd?.trim().toLowerCase()
    const code = rawCode.join('=>').trim()

    const filePath = path.join(PLUGIN_DIR, `${name}.js`)
    if (!fs.existsSync(filePath)) {
      return sock.sendMessage(from, { text: `❌ Plugin '${name}' tidak ditemukan.` })
    }

    try {
      fs.writeFileSync(filePath, code)
      global.COMMANDS = await loadCommands()
      await sock.sendMessage(from, { text: `✅ Plugin '${name}' berhasil diperbarui & dimuat ulang!` })
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Gagal memperbarui:\n${e.message}` })
    }
  }
}