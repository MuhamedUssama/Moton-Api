const express = require("express");

const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .get(authServices.prodect, authServices.allowedTo("admin"), getCoupons)
  .post(authServices.prodect, authServices.allowedTo("admin"), createCoupon);
router
  .route("/:id")
  .get(authServices.prodect, authServices.allowedTo("admin"), getCoupon)
  .put(authServices.prodect, authServices.allowedTo("admin"), updateCoupon)
  .delete(authServices.prodect, authServices.allowedTo("admin"), deleteCoupon);

module.exports = router;
