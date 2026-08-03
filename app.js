const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //helps to create templates (common layouts)
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

//connects mongoDB
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); //for using req. params and body to get parsed
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("hi Im root");
});

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

//use routes files
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

//method for reviewSChema validation (server side validation)
const validatReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body); //req.body checks if reviewSchema created in Joi satifies all condtions or not
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //seperates all err details joins the err msg and sepretae by ,
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//if no route matches then this will get executed
//ERROR FOR *
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found"));
// });

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});



/*
//cookies stores some info in our browers which is used by diff page of our website
const cookieParser = require("cookie-parser");

app.use(cookieParser("secretcode")); //with value a secret code is attached

app.get("/getsignedCookie", (req, res) => {
  res.cookie("made-in", "India", { signed: true }); //name: value pair
  res.send("signed cookie sent");
});

app.get("/verify", (req, res) => {
  //console.log(req.cookies); //gives unsigned cookies
  console.log(req.signedCookies);
  res.send("verified coookie");
});
*/



//sample data for testing
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//        title: "My Home",
//        description:"By the beach",
//        price: 1500,
//        location:"Goa",
//        country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
