const express = require("express");

const {
  createBookValidator,
  updateBookValidator,
  deleteBookValidator,
} = require("../utils/validator/bookValidator");

const {
  createBookPublisher,
  updateBookPublisher,
  deleteBookPublisher,
  uploadBookImage,
  resizeImages,
  // uploadBookPdf,
} = require("../services/bookServices");

const authServices = require("../services/authServices");

const reviewsRoute = require("./reviewRoute");

const router = express.Router();

//POST /books/ndfjhjdshfhsdhfusdi/reviews
//GET /books/ndfjhjdshfhsdhfusdi/reviews
//GET /books/ndfjhjdshfhsdhfusdi/reviews/hfudhfuihdsfh
router.use("/:bookId/reviews", reviewsRoute);

router.route("/").post(
  authServices.prodect,
  authServices.allowedTo("admin", "publisher"),
  uploadBookImage,
  resizeImages,
  // uploadBookPdf,
  createBookValidator,
  createBookPublisher
);
router
  .route("/:id")
  .put(
    authServices.prodect,
    authServices.allowedTo("admin", "publisher"),
    uploadBookImage,
    resizeImages,
    // uploadBookPdf,
    updateBookValidator,
    updateBookPublisher
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin", "publisher"),
    deleteBookValidator,
    deleteBookPublisher
  );

module.exports = router;
