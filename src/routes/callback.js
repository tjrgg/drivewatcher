const router = module.exports = require("express").Router();

const passport = require("passport");

router.get("/callback", (req, res) => {
    passport.authenticate("google", {failureRedirect: "/auth" }), (req, res) => {
        res.redirect("/");
    }
});
