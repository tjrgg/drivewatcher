const config = require("../config.js");

const { Client, Collection } = require("discord.js");

const { parse, sep } = require("path");
const { promisify } = require("util");
let { readdir, readdirSync } = require("fs");
readdir = promisify(readdir);

const klaw = require("klaw");

const express = require("express");
const bodyParser = require("body-parser");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

class Bot extends Client {
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

    passport.use(new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
        accessType: "offline",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, (accessToken, refreshToken, profile, cb) => cb(null, extractProfile(profile))));
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));
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
