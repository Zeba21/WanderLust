const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//signup
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      //This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings");
      });
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

//passport.authenticate() is a route middleware that veirfies if user has already registered
//failureRedirect => executes if user failed to log in
//failureflash => if user fails to auth a flash msg gets displayed
//if user gets logged in then callback executes
router.post(
  "/login",
  saveRedirectUrl, //save path
  passport.authenticate("local", {
    //first login then.. redirect to same path
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back to WanderLust!");
    let redirectUrl = res.locals.redirectUrl || "/listings"; //redirect to listing when directly clicking login 1st or prev path
    res.redirect(redirectUrl); //after login user is redirected to path
  },
);

router.get("/logout", (req, res, next) => {
  // Invoking logout() will remove the req.user property and clear the login session.
  //req.logout takes a callback as a param (after user logs out what work to perform)
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are Logged Out!");
    res.redirect("/listings");
  });
});

module.exports = router;
