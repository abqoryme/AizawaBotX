import fs from 'fs'

export default {
  name: 'listplugin',
  async execute(sock, { from }) {
    const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'))
    const list = files.map(f => '- ' + f.replace('.js', '')).join('\n')
    await sock.sendMessage(from, { text: `📦 Plugin yang tersedia:\n\n${list}` })
  }
}