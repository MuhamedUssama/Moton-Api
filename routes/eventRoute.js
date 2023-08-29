const express = require("express");

const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  resizeImages,
} = require("../services/eventServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .get(getEvents)
  .post(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadEventImage,
    resizeImages,
    createEvent
  );
router
  .route("/:id")
  .get(getEvent)
  .put(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadEventImage,
    resizeImages,
    updateEvent
  )
  .delete(authServices.prodect, authServices.allowedTo("admin"), deleteEvent);

module.exports = router;
