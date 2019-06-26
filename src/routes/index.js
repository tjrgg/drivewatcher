const router = module.exports = require("express").Router();

router.get("/", (req, res) => {
    res.send('This is a project for Discord\'s 2019 Hack Week.');
})
