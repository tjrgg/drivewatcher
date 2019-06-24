module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message, args) {
        try {
            const msg = await message.channel.send("Pong!");
            msg.edit(`Pong! (Roundtrip: ${msg.createdTimestamp - message.createdTimestamp}ms; Heartbeat: ${Math.round(this.client.ping)}ms)`);
        }
        catch (e) {
            console.error(e);
        }
    }
}
