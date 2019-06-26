module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        console.log(`Received message (${message.id}) from @${message.author.tag} (${message.author.id}) in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id}).`);

        if (message.author.bot) return;
        if (!message.content.startsWith(this.client.config.prefix)) return;

        const args = message.content.slice(this.client.config.prefix.length).trim().split(/\s+/g);
        const cmdName = args.shift().toLowerCase();

        if (!this.client.commands.has(cmdName)) return;
        const cmd = this.client.commands.get(cmdName);

        cmd.run(message, args).catch(e => console.error(e));
    }
}
