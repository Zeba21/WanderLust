const express = require("express");
const router = express.Router(); //express router helps to screate seperates common routes so that app.js cant become bloated
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js"); //joi
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

//valiation err handling func
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body); //req.body checks if listingSchema created in Joi satifies all condtions or not
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //seperates all err details joins the err msg and sepretae by ,
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  //isLoggedIn is a middleware
  //console.log(req.user); //req.user stores user logged in info
  res.render("listings/new.ejs");
});

//Show Route (R)
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      console.log(req.flash("error"));
      req.flash("error", "Listing does not Exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  }),
);

//create Route (C)
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // let {title, description, image, price, location, country} = req.body; //in place of this use js object method
    const newListing = new Listing(req.body.listing); //req.body.listing => listing is obj whose data comes from new.ejs
    await newListing.save();
    //access this msg in app.js
    req.flash("success", "New Listing Created!"); //flash msg passed using key:msg pair
    //use this flash msg where this route is redirecting (appears only once)
    res.redirect("/listings");
  }),
);

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing does not Exist!");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }),
);

//Update Route (U)
router.put(
  "/:id",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", " Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

//Delete route (D)
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id); //when this is called the middleware listingSchema.post in listiing.js is called too
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
