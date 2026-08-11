module.exports.isLoggedIn = (req, res, next) => {
  //this passport method checks whether user is logged in or not (if true render new form else don't)
  if (!req.isAuthenticated()) {
    //if user tries to access a path but didnt logged in 1st (prevpath -> login 1st -> redirect to prevpath)
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must Login first!");
    return res.redirect("/login");
  }
  next();
};

//passport can dlt the redirectUrl while resetting user session so we store this in locals (passport doesnt have access to locals)
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl; //save url in session 1st then in locals
  }
  next();
};
