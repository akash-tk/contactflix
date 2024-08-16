const validateToken = require("../middleware/validateToken");
const { validateContact, Contact } = require("../models/contact");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = require("express").Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname).toLowerCase();
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      req.fileValidationError = "Only image files are allowed!";
      return cb(new Error("Only image files are allowed!"), false);
    }
  },
}).single("profilePicture");


router.post("/contact", validateToken, upload, async (req, res) => {
  console.log("User ID:", req.user); 

  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  const { error } = validateContact(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { firstName, lastName, address, company, phoneNumbers } = req.body;
  const profilePicture = req.file ? req.file.path : null;

  try {
    
    for (const phone of phoneNumbers) {
      const existingContact = await Contact.findOne({
        phoneNumbers: phone,
        user: req.user._id,
      });
      if (existingContact) {
        return res.status(400).json({ error: `Phone number ${phone} already exists` });
      }
    }

    const newContact = new Contact({
      firstName,
      lastName,
      address,
      company,
      phoneNumbers,
      profilePicture,
      user: req.user._id,  
    });
    const result = await newContact.save();

    return res.status(201).json({ ...result._doc });
  } catch (err) {
    console.error("Error creating contact:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/mycontacts", validateToken, async (req, res) => {
  const { page = 1, limit = 4, search = "" } = req.query; 

  try {
    const skip = (page - 1) * limit;

    
    const searchCondition = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
            { phoneNumbers: { $regex: search, $options: "i" } },
          ],
          user: req.user._id,
        }
      : { user: req.user._id };

    const myContacts = await Contact.find(searchCondition)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(parseInt(limit));

    const totalContacts = await Contact.countDocuments(searchCondition);

    return res.status(200).json({
      contacts: myContacts,
      totalContacts,
      totalPages: Math.ceil(totalContacts / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/contact/:id", validateToken, upload, async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "No ID specified" });

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Please enter a valid ID" });
  }

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (req.user._id.toString() !== contact.user.toString()) {
      return res.status(401).json({ error: "You are not authorized to edit this contact" });
    }

    const { phoneNumbers } = req.body;

    
    for (const phone of phoneNumbers) {
      const existingContact = await Contact.findOne({
        phoneNumbers: phone,
        user: req.user._id,
        _id: { $ne: id },
      });
      if (existingContact) {
        return res.status(400).json({ error: `Phone number ${phone} already exists` });
      }
    }

    const updatedData = { ...req.body };
    if (req.file) {
      updatedData.profilePicture = req.file.path;
    } else {
      delete updatedData.profilePicture;
    }

    
    const hasChanges = Object.keys(updatedData).some(
      (key) => updatedData[key] !== contact[key]
    );

    if (!hasChanges) {
      return res.status(400).json({ error: "No changes detected" });
    }

    const result = await Contact.findByIdAndUpdate(id, updatedData, { new: true });

    return res.status(200).json({ ...result._doc });
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/delete/:id", validateToken, async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 4 } = req.query;

  if (!id) return res.status(400).json({ error: "No ID specified" });

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Please enter a valid ID" });
  }

  try {
    const contact = await Contact.findById(id);

    if (!contact) return res.status(404).json({ error: "Contact not found" });

    if (req.user._id.toString() !== contact.user.toString()) {
      return res.status(401).json({ error: "You are not authorized to delete this contact" });
    }

    if (contact.profilePicture) {
      fs.unlinkSync(contact.profilePicture);
    }

    await Contact.deleteOne({ _id: id });

    
    const skip = (page - 1) * limit;

    const myContacts = await Contact.find({ user: req.user._id })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(parseInt(limit));

    const totalContacts = await Contact.countDocuments({ user: req.user._id });

    return res.status(200).json({
      contacts: myContacts, 
      totalContacts,
      totalPages: Math.ceil(totalContacts / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/contact/:id", validateToken, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "No ID specified" });

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Please enter a valid ID" });
  }

  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.error("Error fetching contact:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
