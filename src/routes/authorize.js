const router = module.exports = require("express").Router();

const passport = require("passport");

router.get("/auth", (req, res) => {
    passport.authenticate("google", {scope: ["email", "profile"]})
})
