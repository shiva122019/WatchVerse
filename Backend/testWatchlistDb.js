require("dotenv").config();
const mongoose = require("mongoose");
const WatchList = require("./Models/WatchList");

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB.");

  const items = await WatchList.find({});
  console.log("Total WatchList items:", items.length);
  items.forEach(item => {
    console.log(`ID: ${item._id}, tmdbId: ${item.tmdbId}, mediaType: ${item.mediaType}, status: ${item.status}`);
  });

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch(console.error);
