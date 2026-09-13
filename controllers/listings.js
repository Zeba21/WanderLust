const Listing = require("../models/listing.js");
const maptilerClient = require("@maptiler/client");

// MapTiler config
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  //console.log(req.user); //req.user stores user logged in info
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    console.log(req.flash("error"));
    req.flash("error", "Listing does not Exist!");
    return res.redirect("/listings");
  }
  //console.log(listing);
  res.render("listings/show.ejs", {
    listing,
    mapKey: process.env.MAPTILER_API_KEY,
  });
};

module.exports.createListing = async (req, res, next) => {
  // 1. Forward geocode using MapTiler
  const response = await maptilerClient.geocoding.forward(
    req.body.listing.location,
    { limit: 1 },
  );

  console.log("--- GEODATA RESULT ---");
  console.log(response.features[0].geometry);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // Handle uploaded image file if present
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }
  if (!response.features.length) {
    req.flash("error", "Location could not be found");
    return res.redirect("/listings/new");
  }

  newListing.geometry = response.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New Listing Created!");
  // Redirect with backticks template literals
  res.redirect(`/listings/${savedListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not Exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_150,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  //this updates new image file while editing listing
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", " Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); //when this is called the middleware listingSchema.post in listiing.js is called too
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
