const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

//signup
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.flash("success", "Registeration successful!");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }),
);

//login
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

//passport.auth() is a route middleware that veirfies if user has already registered
//failureRedirect executes if user failed to log in
//failurflash => if user fails to auth a flash msg gets displayed
//if user gets logged in then callback executes
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back to Wanderlust!");
    res.redirect("/listings");
  },
);

module.exports = router;
