const express = require("express");

const {
  createBookValidator,
  getBookValidator,
  updateBookValidator,
  deleteBookValidator,
} = require("../utils/validator/bookValidator");

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadBookImage,
  resizeImages,
  // uploadBookPdf,
} = require("../services/bookServices");

const authServices = require("../services/authServices");

const router = express.Router();

router.route("/").get(getBooks).post(
  authServices.prodect,
  authServices.allowedTo("admin", "publisher"),
  uploadBookImage,
  resizeImages,
  // uploadBookPdf,
  createBookValidator,
  createBook
);
router
  .route("/:id")
  .get(getBookValidator, getBook)
  .put(
    authServices.prodect,
    authServices.allowedTo("admin", "publisher"),
    uploadBookImage,
    resizeImages,
    // uploadBookPdf,
    updateBookValidator,
    updateBook
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin", "publisher"),
    deleteBookValidator,
    deleteBook
  );

module.exports = router;
