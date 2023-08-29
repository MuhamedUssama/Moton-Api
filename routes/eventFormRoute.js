const express = require("express");
const authServices = require("../services/authServices");
const {
  addEventForm,
  deleteEventForm,
} = require("../services/eventFormServices");

const router = express.Router();

// Use :eventId as the parameter in the route definition
router.post(
  "/:eventId",
  authServices.prodect,
  authServices.allowedTo("user"),
  addEventForm
);

module.exports = router;
