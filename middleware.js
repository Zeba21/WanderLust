const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); //joi

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

//this middleware checks if currUser is owner or not
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  //server side route handling
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
//valiation err handling func
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body); //req.body checks if listingSchema created in Joi satifies all condtions or not
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //seperates all err details joins the err msg and sepretae by ,
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//method for reviewSChema validation (server side validation)
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body); //req.body checks if reviewSchema created in Joi satifies all condtions or not
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //seperates all err details joins the err msg and sepretae by ,
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
