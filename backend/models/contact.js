const mongoose = require("mongoose");
const Joi = require("joi");

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z\s]+$/.test(v); 
        },
        message: "First name can only contain letters and spaces.",
      },
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z\s]+$/.test(v); 
        },
        message: "Last name can only contain letters and spaces.",
      },
    },
    address: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phoneNumbers: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0; 
        },
        message: "At least one phone number is required.",
      },
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


function validateContact(contact) {
  const schema = Joi.object({
    firstName: Joi.string()
      .trim()
      .regex(/^[A-Za-z\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "First name can only contain letters and spaces.",
      }),
    lastName: Joi.string()
      .trim()
      .regex(/^[A-Za-z\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "Last name can only contain letters and spaces.",
      }),
    address: Joi.string().trim().allow(""),
    company: Joi.string().trim().allow(""),
    phoneNumbers: Joi.array().items(Joi.string().required()).min(1).required(),
    profilePicture: Joi.string().trim().allow(""),
  });

  return schema.validate(contact);
}

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact, validateContact };
