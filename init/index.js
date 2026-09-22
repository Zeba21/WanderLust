// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//   await Listing.deleteMany({}); //del old data if present
//   initData.data = initData.data.map((obj) => ({
//     ...obj,
//     owner: "6a7339b168d205eb44eb894e",
//   })); //creates a new array add owner to each array(listing)
//   await Listing.insertMany(initData.data); //initialise new data (.data coz we r exporting sampledata in obj form key val pair)
//   console.log("data was initialised");
// };

// initDB();
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

console.log("KEY EXISTS:", !!process.env.MAPTILER_API_KEY);
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const maptilerClient = require("@maptiler/client");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await Listing.deleteMany({});
    console.log("Old data deleted");

    console.log("Total data:", initData.data.length);

    const listingsWithGeometry = [];

    for (let obj of initData.data) {
      console.log("Geocoding:", obj.location);

      const response = await maptilerClient.geocoding.forward(obj.location, {
        limit: 1,
      });

      if (!response.features.length) {
        console.log("Location not found:", obj.location);
        continue;
      }

      const listing = {
        ...obj,
        owner: "6a7339b168d205eb44eb894e",
        geometry: response.features[0].geometry,
      };

      listingsWithGeometry.push(listing);

      console.log("Coordinates:", response.features[0].geometry.coordinates);
    }

    console.log("Listings ready:", listingsWithGeometry.length);

    await Listing.insertMany(listingsWithGeometry);

    console.log("Data was initialised");

    await mongoose.connection.close();
  } catch (err) {
    console.log("ERROR:", err);
  }
}

main();
