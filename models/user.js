const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.
const passportLocalMongoose = require("passport-local-mongoose").default;

//user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  //Passport-Local Mongoose will automatically add a username, hash and salt field to store the username, the hashed password and the salt value.
  //Additionally, Passport-Local Mongoose adds some methods to your Schema
});

// console.log(passportLocalMongoose);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

//what all packages to download for user authentication , npm i passport, npm i passport-local, npm i passport-local-mangoose
