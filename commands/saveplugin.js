import fs from 'fs'
import path from 'path'
import { loadCommands } from '../lib/handler.js'
import { OWNER_NUMBERS } from '../config.js'

const PLUGIN_DIR = './commands'

export default {
  name: 'saveplugin',
  async execute(sock, { from, msg, text, sender }) {
    if (!OWNER_NUMBERS.includes(sender)) {
      return sock.sendMessage(from, { text: '❌ Hanya owner yang boleh menggunakan perintah ini.' })
    }

    const [cmd, ...rawCode] = text.replace(/^\.?saveplugin\s*/i, '').split('=>')
    const name = cmd?.trim().toLowerCase()
    const code = rawCode.join('=>').trim()

    if (!name || !code.includes('export default')) {
      return sock.sendMessage(from, {
        text: '❌ Format salah!\nContoh:\nsaveplugin jam => export default { name: "jam", async execute(...) { ... } }'
      })
    }

    const filePath = path.join(PLUGIN_DIR, `${name}.js`)

    try {
      fs.writeFileSync(filePath, code)
      global.COMMANDS = await loadCommands()
      await sock.sendMessage(from, { text: `✅ Plugin '${name}' berhasil disimpan & dimuat ulang!` })
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Gagal menyimpan:\n${e.message}` })
    }
  }
}