const Client = require("./structures/Client.js");

const { parse } = require("path");
const { promisify } = require("util");
let { readdir, readdirSync } = require("fs");
readdir = promisify(readdir);

const klaw = require("klaw");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const client = new Client();

const server = new express();
const serverPort = client.config.port || 3000;

passport.use(new GoogleStrategy({
    clientID: client.config.googleClientId,
    clientSecret: client.config.googleClientSecret,
    callbackURL: client.config.googleCallbackUrl,
    accessType: "offline",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, (accessToken, refreshToken, profile, cb) => cb(null, profile)));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(session({secret: 'hackweek', resave: true, saveUninitialized: true}));
server.use(passport.initialize());
server.use(passport.session());

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
