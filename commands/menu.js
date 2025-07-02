import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'

export default {
  name: 'menu',
  async execute(sock, { from, msg, text }) {
    const pushname = msg.pushName || 'User'
    const namabot = 'Assiten Ai'
    const ownername = 'Abqory🎓'
    const imagePath = path.resolve('./media/thumb.jpg')

    const media = await prepareWAMessageMedia({
      image: { url: imagePath }
    }, { upload: sock.waUploadToServer })

    const menuMsg = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: { text: `Hai ${pushname}, silakan pilih menu:` },
            footer: { text: namabot },
            header: {
              ...media,
              gifPlayback: true,
              subtitle: ownername,
              hasMediaAttachment: false
            },
            nativeFlowMessage: {
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'PILIH MENU',
                  sections: [
                    {
                      title: 'Menu Utama',
                      rows: [
                        {
                          header: 'Ping',
                          title: 'Tes respon bot',
                          description: 'Klik untuk tes ping',
                          id: `ping`
                        },
                        {
                          header: 'Info',
                          title: 'Tentang bot',
                          description: 'Lihat info bot ini',
                          id: `info`
                        }
                      ]
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
    await sock.relayMessage(from, menuMsg.message, { messageId: menuMsg.key.id })
  }
}