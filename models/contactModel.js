const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name required"],
      minLength: [3, "Too short name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    phone: String,

    email: {
      type: String,
      required: [true, "Email required"],
    },

    message: {
      type: String,
      required: [true, "Message required"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const ContactModel = mongoose.model("Contact", contactSchema);

module.exports = ContactModel;
