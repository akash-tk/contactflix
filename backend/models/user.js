const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true, 
    match: [/^[A-Za-z\s]+$/, "First name should contain only alphabetic characters and spaces."]
  },
  lastName: { 
    type: String, 
    required: true, 
    match: [/^[A-Za-z\s]+$/, "Last name should contain only alphabetic characters and spaces."]
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  phoneNumbers: [{ type: String }], 
  address: { type: String, required: true },
  profilePicture: { type: String }, 
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
