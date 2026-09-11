const express = require("express");
const router = express.Router(); //express router helps to screate seperates common routes so that app.js cant become bloated
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); //multer auto creates a folder and saves file in it

//Use router.route() to avoid duplicate route naming (is pth is same combine in one)
router
  .route("/")
  //Index Route
  .get(wrapAsync(listingController.index)) //index callback is present in controllers

  //create route
  .post(
    isLoggedIn,

    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm); //isLoggedIn is a middleware

router
  .route("/:id") //same route for show, update, dlt
  //show route
  .get(wrapAsync(listingController.showListing))
  //update route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  //delete route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
