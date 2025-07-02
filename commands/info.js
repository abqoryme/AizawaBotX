export default {
    name: 'info',
    description: 'Info bot',
    async execute(sock, m) {
        await sock.sendMessage(m.from, { text: 'Bot ini dibuat dengan @fizzxydev/baileys-pro 🚀' })
    }
}