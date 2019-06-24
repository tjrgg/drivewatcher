module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        this.client.user.setActivity(`${this.client.config.prefix}help | ${this.client.guilds.size} servers`);
        console.log(`Ready. Serving ${this.client.guilds.size} guilds.`);
    }
}
