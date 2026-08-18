const User = require("../models/user.js");

module.exports.rendersignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome Back to WanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings"; //redirect to listing when directly clicking login 1st or prev path
  res.redirect(redirectUrl); //after login user is redirected to path
};

module.exports.logout = (req, res, next) => {
  // Invoking logout() will remove the req.user property and clear the login session.
  //req.logout takes a callback as a param (after user logs out what work to perform)
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are Logged Out!");
    res.redirect("/listings");
  });
};
