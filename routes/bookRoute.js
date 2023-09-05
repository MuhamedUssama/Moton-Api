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
  createBookAdmin,
  updateBookAdmin,
  deleteBookAdmin,
  uploadBookImage,
  resizeImages,
} = require("../services/bookServices");

const authServices = require("../services/authServices");

const reviewsRoute = require("./reviewRoute");

const router = express.Router();

const pdfFileMiddleware = require("../middleware/uploadPdfMiddleware");

//POST /books/ndfjhjdshfhsdhfusdi/reviews
//GET /books/ndfjhjdshfhsdhfusdi/reviews
//GET /books/ndfjhjdshfhsdhfusdi/reviews/hfudhfuihdsfh
router.use("/:bookId/reviews", reviewsRoute);

router
  .route("/")
  .get(getBooks)
  .post(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadBookImage,
    resizeImages,
    createBookValidator,
    createBookAdmin
  );

const uploadPdf = require("../middleware/uploadPdfMiddleware");

router.post("/upload", (req, res) => {
  uploadPdf.postPDF(req, res);
});

const BookModel = require("../models/bookModel");
const pdfFileMiddlewaree = require("../middleware/pdf");

// Route to update the 'pdf' field in the Book model
router.post("/upload-pdf/:bookId", pdfFileMiddlewaree, (req, res) => {
  // The 'pdfFileMiddleware' middleware will handle the PDF upload and update the 'pdf' field.
  // You can access the updated book object in 'req.book' (assuming it was updated in the middleware).

  // Optionally, you can respond with the updated book object.
  res.status(200).json({
    message: "PDF uploaded and book updated successfully",
    updatedBook: req.book,
  });
});

router
  .route("/:id")
  .get(getBookValidator, getBook)
  .put(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadBookImage,
    resizeImages,
    updateBookValidator,
    updateBookAdmin
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin"),
    deleteBookValidator,
    deleteBookAdmin
  );

const Book = require("../models/bookModel");

//search api
// url   /api/v1/books/search/searchWord
router.get("/search/:key", async (req, res) => {
  const data = await Book.find({
    $or: [
      { bookName: { $regex: req.params.key } },
      { slug: { $regex: req.params.key } },
      { description: { $regex: req.params.key } },
    ],
  });
  res.send(data);
});

module.exports = router;
