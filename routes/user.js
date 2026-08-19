const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");
const { signup, rendersignupForm } = require("../controllers/users.js");

router
  .route("/signup") //same route for get and post
  //show route
  .get(userController.rendersignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  //login
  .get(userController.renderLoginForm)

  //passport.authenticate() is a route middleware that veirfies if user has already registered
  //failureRedirect => executes if user failed to log in
  //failureflash => if user fails to auth a flash msg gets displayed
  //if user gets logged in then callback executes
  .post(
    saveRedirectUrl, //save path
    passport.authenticate("local", {
      //first login then.. redirect to same path
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login,
  );

router.get("/logout", userController.logout);

module.exports = router;
