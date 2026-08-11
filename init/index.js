const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB = async () => {
  await Listing.deleteMany({}); //del old data if present
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a7339b168d205eb44eb894e",
  })); //creates a new array add owner to each array(listing)
  await Listing.insertMany(initData.data); //initialise new data (.data coz we r exporting sampledata in obj form key val pair)
  console.log("data was initialised");
};

initDB();
