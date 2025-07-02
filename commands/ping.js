export default {
    name: 'ping',
    description: 'Balas dengan pong',
    async execute(sock, m) {
        await sock.sendMessage(m.from, { text: 'Pong!. Pong!. Pong! 🏓' })
    }
}