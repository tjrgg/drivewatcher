const { Client, Collection } = require("discord.js");

const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const path = require("path");

const klaw = require("klaw");

class Bot extends Client {
    constructor(options) {
        super(options);

        this.config = require("../config.js");

        this.commands = new Collection();
    }

    loadCommand(cmdPath, cmdName) {
        try {
            const cmd = new (require(`${cmdPath}${path.sep}${cmdName}.js`))(this);
            if (cmd.init) cmd.init(this);
            this.commands.set(cmdName, cmd);
            return false;
        }
        catch (e) {
            return `Failed to load ${cmdName} command: ${e}`;
        }
    }

    unloadCommand(cmdPath, cmdName) {
        if (this.commands.has(cmdName)) {
            this.commands.delete(cmdName);
            delete require.cache[require.resolve(`${cmdPath}${path.sep}${cmdName}.js`)];
            return false;
        }
        else return `${cmdName} command not loaded.`;
    }
}

const client = new Bot();

const init = async () => {
    klaw("./src/commands").on("data", (item) => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}`);
      if (response) console.error(response);
    });

    const eventFiles = await readdir("./src/events/");
    eventFiles.forEach(file => {
      const eventName = file.split(".")[0];
      const event = new (require(`./events/${file}`))(client);
      client.on(eventName, (...args) => event.run(...args));
      delete require.cache[require.resolve(`./events/${file}`)];
    });

    client.login(client.config.token);
}

init();

client.on("disconnect", () => console.warn("Disconnecting..."))
    .on("reconnecting", () => console.log("Reconnecting..."))
    .on("error", e => console.error(e))
    .on("warn", i => console.warn(i));
