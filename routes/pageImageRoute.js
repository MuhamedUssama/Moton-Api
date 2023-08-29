const express = require("express");

const {
  createpageImage,
  updatepageImage,
  deletepageImage,
  uploadpageImage,
  resizeImages,
} = require("../services/pageImageServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .post(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadpageImage,
    resizeImages,
    createpageImage
  );
router
  .route("/:id")
  .put(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadpageImage,
    resizeImages,

    updatepageImage
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin"),
    deletepageImage
  );

module.exports = router;
