const { Client, Collection } = require("discord.js");

const { promisify } = require("util");
let { readdir, readdirSync } = require("fs");
readdir = promisify(readdir);
const { sep, parse } = require("path");

const klaw = require("klaw");

const express = require("express");
const bodyParser = require("body-parser");

class Bot extends Client {
    constructor(options) {
        super(options);

        this.config = require("../config.js");

        this.commands = new Collection();
    }

    async loadCommand(cmdPath, cmdName) {
        const cmd = new (require(`${cmdPath}${sep}${cmdName}.js`))(this);
        if (cmd.init) cmd.init(this);
        this.commands.set(cmdName, cmd);
    }
}

const client = new Bot();

const server = new express();
server.use(bodyParser.json());
const serverPort = client.config.port || 3000;

const init = async () => {
    klaw("./src/commands").on("data", (item) => {
      const cmdFile = parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      client.loadCommand(cmdFile.dir, `${cmdFile.name}`).catch(e => console.error(e));
    });

    const eventFiles = await readdir("./src/events/");
    eventFiles.forEach(file => {
      const eventName = file.split(".")[0];
      const event = new (require(`../src/events/${file}`))(client);
      client.on(eventName, (...args) => event.run(...args));
      delete require.cache[require.resolve(`../src/events/${file}`)];
    });

    readdirSync("./src/routes/").forEach(route => server.use(require(`./routes/${route}`)));

    client.login(client.config.discordToken);
    server.listen(serverPort, function () {
        console.log(`Server running on port ${serverPort}.`);
    });
}

init();

client.on("disconnect", () => console.warn("Disconnecting..."))
    .on("reconnecting", () => console.log("Reconnecting..."))
    .on("error", e => console.error(e))
    .on("warn", i => console.warn(i));
