const multer = require("multer");
const path = require("path");
const helpers = require("../helpers/pdfFilter");
const BookModel = require("../models/bookModel");

function pdfFileMiddlewaree(req, res, next) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/pdfs");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: helpers.pdfFilter,
  }).single("pdf");

  upload(req, res, async function (err) {
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send("Please select a PDF to upload");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }

    // Assuming that the book ID is available in the request body or params
    const bookId = req.body.bookId; // Modify this based on how you pass the book ID

    try {
      const updatedBook = await BookModel.findByIdAndUpdate(
        bookId,
        { pdf: req.file.filename },
        { new: true }
      );

      // The book PDF has been updated successfully
      req.book = updatedBook;
      next();
    } catch (updateErr) {
      return res.status(500).send("Error updating book PDF");
    }
  });
}

module.exports = pdfFileMiddlewaree;
