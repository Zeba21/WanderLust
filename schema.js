//joi is used for server side individual field validation err handling ( it automatically handles server side schema validation)
const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  //listing is an object according to JOI schema validation and it should be required always
  //whenever we get a req is must conatin a listing object
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    category: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null),
  }).required(),
});

//server side vallidation for reviews
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(), //if request is coming then it should contain review obj
});
