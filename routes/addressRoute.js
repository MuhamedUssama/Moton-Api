const express = require("express");

const authServices = require("../services/authServices");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../services/addressServices");

const router = express.Router();

router
  .route("/")
  .post(authServices.prodect, authServices.allowedTo("user"), addAddress)
  .get(
    authServices.prodect,
    authServices.allowedTo("user"),
    getLoggedUserAddresses
  );

router.delete(
  "/:addressId",
  authServices.prodect,
  authServices.allowedTo("user"),
  removeAddress
);

module.exports = router;
