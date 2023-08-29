const mongoose = require("mongoose");

const couponShcema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon must have name"],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "Coupon must have an expired date"],
    },
    discout: {
      type: Number,
      required: [true, "Coupon discount is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponShcema);
