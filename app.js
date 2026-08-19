if (process.env.NODE_ENV != "production") {
  //necesary for dev phase
  require("dotenv").config();
}
console.log(process.env.SECRET); //Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //helps to create templates (common layouts)
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport"); //Passport is Express-compatible authentication middleware for Node.js. (pbkdf2 hashing algo is used in passport)
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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

app.use(passport.initialize()); //for every req passport gets initialized , passport uses sessions so use session 1st
app.use(passport.session()); // (web app should know whether a req  going from one page to another is sent by same user) , this series of req res assciated with same useris called session
passport.use(new LocalStrategy(User.authenticate()));

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //stores user info in session (user login info)
passport.deserializeUser(User.deserializeUser()); //removes users info from session

//flash middleware (we can store req obj here to access in ejs template)
app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //in req.flash if any success msg comes it saves in res.locals
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next(); //if we dont call next then stucks here only
});

// app.get("/demoUser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "student1",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); //Convenience method to register a new user instance with a given password. Checks if username is unique.
//   res.send(registeredUser);
// });

//use routes files
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

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
