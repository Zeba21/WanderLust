const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //helps to create templates (common layouts)
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

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

const sessionOptions = {
  secret: "mysupersecretcode", //for temp
  resave: false,
  saveUninitialized: true,
  //cookie tracks sessions
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //milisec in 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //for security from cross scripting attacks
  },
};

app.get("/", (req, res) => {
  res.send("hi Im root");
});

app.use(session(sessionOptions));
app.use(flash()); //use flash just before routes

//flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //in req.flash if any success msg comes it saves in res.locals
  res.locals.error = req.flash("error");
  next(); //if we dont call next then stucks here only
});

//use routes files
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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
//express session to store useful info on browers (ex: without creating acc we can add item to cart in some websites )
const session = require("express-session");

const sessionOptions = {
  secret: "mysupersecret", //secrest code
  resave: "false",         //temprory storage
  saveUninitialised: true, //is session is not initialised then also save 
}

app.use(session(sessionOptions)); //for any req a session id is created 

app.get("/register", (req, res) => {
  let { name } = req.query; //extract name from query
  //this is so store session info
  req.session.name = name; //req.session is an obj , name is variable
  res.redirect(req.session.name);
});

app.get("/hello", (req, res) => {
  res.send(`hello, ${req.session.name}`); //this is how we can extract/use session info from seperate route
} );

//to count no of req user send use if(req.session.count){req.session.count++;}
*/

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
