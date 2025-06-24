const mongoose = require("mongoose");
const DATABASE_URL = process.env.DATABASE_URL;

const connectDB = () => {
  try {
    mongoose.set("runValidators", true);
    mongoose.connection.on("connected", () => {
      console.log(`Mongo Database Connected`);
    });
    return mongoose.connect(DATABASE_URL);
  } catch (error) {
    mongoose.connection.on("error", (error) => {
      console.log(error.message);
    });
  }
};

module.exports = connectDB;
