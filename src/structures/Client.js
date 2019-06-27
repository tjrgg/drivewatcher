const config = require("../../config.js");
const { Client, Collection } = require("discord.js");
const { sep } = require("path");

module.exports = class Bot extends Client {
    constructor(options) {
        super(options);

        this.config = config;

        this.commands = new Collection();
    }

    async loadCommand(cmdPath, cmdName) {
        const cmd = new (require(`${cmdPath}${sep}${cmdName}.js`))(this);
        if (cmd.init) cmd.init(this);
        this.commands.set(cmdName, cmd);
    }
}
