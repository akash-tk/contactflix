const mongoose = require("mongoose");

const connectDB = async () => {
  return mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("connection to database established..."))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
