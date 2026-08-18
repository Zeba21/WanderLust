const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
  //if we r storing anyhting in db use async
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review); //review=> comes from show.ejs
  newReview.author = req.user._id;

  listing.reviews.push(newReview); //push newReview coming to listings/id/reviews to reviews[] array

  await newReview.save();
  await listing.save();
  req.flash("success", "Review Added!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  //to dlt the reviewId from review array we use mongoose op $pull=> remove
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pulls reviewId from reviews[]
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
