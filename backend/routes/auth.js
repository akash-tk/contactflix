const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/user");
const validateToken = require("../middleware/validateToken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});
const upload = multer({ storage });


const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[0-9]{10}$/; 
  return phoneRegex.test(phoneNumber);
};


router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    phoneNumbers, 
    address,
  } = req.body;

  const profilePicture = req.file ? req.file.path.replace(/\\/g, "/") : ""; 

  
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !dateOfBirth ||
    !gender ||
    !phoneNumbers ||
    !address
  ) {
    return res.status(400).json({ error: "Please enter all the required fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  
  const phoneNumbersArray = JSON.parse(phoneNumbers);
  if (!Array.isArray(phoneNumbersArray) || phoneNumbersArray.length === 0) {
    return res.status(400).json({ error: "Phone numbers are required" });
  }

  const phoneSet = new Set();
  for (let phoneNumber of phoneNumbersArray) {
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: `Invalid phone number: ${phoneNumber}` });
    }
    if (phoneSet.has(phoneNumber)) {
      return res.status(400).json({ error: `Duplicate phone number: ${phoneNumber}` });
    }
    phoneSet.add(phoneNumber);
  }

  try {
    const doesUserAlreadyExist = await User.findOne({ email });
    if (doesUserAlreadyExist) {
      return res.status(400).json({ error: `A user with that email [${email}] already exists. Please try another one` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth,
      gender,
      phoneNumbers: phoneNumbersArray, 
      address,
      profilePicture,
    });

    const result = await newUser.save();
    result.password = undefined;

    const payload = { _id: result._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({ token, user: result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter all the required fields" });
  }

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  try {
    const doesUserExist = await User.findOne({ email });
    if (!doesUserExist) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    
    const doesPasswordMatch = await bcrypt.compare(password, doesUserExist.password);
    if (!doesPasswordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    
    const payload = { _id: doesUserExist._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const user = {
      ...doesUserExist._doc,
      password: undefined,
      profilePicture: doesUserExist.profilePicture,
    };

    return res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});


router.get("/me", validateToken, async (req, res) => {
  return res.status(200).json({ ...req.user._doc });
});

module.exports = router;
