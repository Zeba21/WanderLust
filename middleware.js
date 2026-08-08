module.exports.isLoggedIn = (req, res, next) => {
  //this passport method checks whether user is logged in or not (if true render new form else don't)
  if (!req.isAuthenticated()) {
    req.flash("error", "You must Log In first to create listing!");
    return res.redirect("/login");
  }
  next();
};
