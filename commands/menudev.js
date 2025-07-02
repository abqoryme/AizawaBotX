import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'

export default {
  name: 'menudev',
  async execute(sock, { from, msg }) {
    const pushname = msg.pushName || 'User'
    const imagePath = path.resolve('./media/thumb.jpg') // ganti sesuai thumbnail kamu
    const botname = 'Developer Menu'
    const footer = '🔧 Plugin & Command Manager'

    // Ambil data plugin
    const plugins = fs.readdirSync('./commands')
      .filter(f => f.endsWith('.js'))
      .map(f => f.replace('.js', ''))

    // Ambil custom command
    let custom = {}
    try {
      custom = JSON.parse(fs.readFileSync('./data/custom_commands.json'))
    } catch { custom = {} }

    const customList = Object.keys(custom)

    // Siapkan media (gambar header)
    const media = await prepareWAMessageMedia({
      image: { url: imagePath }
    }, { upload: sock.waUploadToServer })

    // Format sesuai nativeFlow
    const devMenu = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: { text: `Hai ${pushname}, berikut menu pengembang:` },
            footer: { text: footer },
            header: {
              ...media,
              gifPlayback: false,
              subtitle: botname,
              hasMediaAttachment: true
            },
            nativeFlowMessage: {
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📁 Plugin & Commands',
                  sections: [
                    {
                      title: '📦 Plugin Commands',
                      rows: plugins.map(p => ({
                        header: 'Plugin',
                        title: p,
                        description: `Jalankan plugin ${p}`,
                        id: p
                      }))
                    },
                    {
                      title: '🧩 Custom Commands',
                      rows: customList.map(c => ({
                        header: 'Custom',
                        title: c,
                        description: `Custom reply untuk ${c}`,
                        id: c
                      }))
                    }
                  ]
                })
              }]
            },
            contextInfo: {
              mentionedJid: [msg.key.participant || msg.key.remoteJid],
              forwardingScore: 999,
              isForwarded: true
            }
          })
        }
      }
    }, { quoted: msg })

    await sock.relayMessage(from, devMenu.message, { messageId: devMenu.key.id })
  }
}