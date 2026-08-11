const express = require("express");
const router = express.Router(); //express router helps to screate seperates common routes so that app.js cant become bloated
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

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
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      console.log(req.flash("error"));
      req.flash("error", "Listing does not Exist!");
      return res.redirect("/listings");
    }
    //console.log(listing);
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
    //console.log(req.user);
    newListing.owner = req.user._id;
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
  isOwner,
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
  isOwner,
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
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id); //when this is called the middleware listingSchema.post in listiing.js is called too
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
