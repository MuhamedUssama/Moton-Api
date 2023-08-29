const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
const { uploadPdf } = require("../middleware/uploadPdfMiddleware");

const factory = require("./handlersFactory");
const Book = require("../models/bookModel");

//upload single image
exports.uploadBookImage = uploadSingleImage("image");

//image processing
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `books-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(700, 1000)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/books/${filename}`);

    //save image into database
    req.body.image = filename;
  }

  next();
});

//upload single pdf
exports.uploadBookPdf = uploadPdf("pdf");

//@Description -->   Get list of Books
//@Route -->   GET /api/v1/books
//@Access -->  User
exports.getBooks = factory.getAll(Book, "books");

//@Description -->   Get specific Book by id
//@Route -->   GET /api/v1/books/ :id
//@Access -->  User
exports.getBook = factory.getOne(Book, "reviews");

//@Description -->   Create Book
//@Route -->   POST /api/v1/books
//@Access -->  Admin
exports.createBookAdmin = factory.createOne(Book);

//@Description -->   Create Book
//@Route -->   POST /api/v1/publisher/books
//@Access -->  Publisher
exports.createBookPublisher = factory.createOne(Book);

//@Description -->   Update Book
//@Route -->   PUT /api/v1/books/id:
//@Access -->  Admin
exports.updateBookAdmin = factory.updateOne(Book);

//@Description -->   Update Book
//@Route -->   PUT /api/v1/publisher/books/id:
//@Access -->  Publisher
exports.updateBookPublisher = factory.updateOne(Book);

//@Description -->   Delete Book
//@Route -->   DELETE /api/v1/books/id:
//@Access -->  Admin
exports.deleteBookAdmin = factory.deleteOne(Book);

//@Description -->   Delete Book
//@Route -->   DELETE /api/v1/publisher/books/id:
//@Access -->  Publisher
exports.deleteBookPublisher = factory.deleteOne(Book);

// Example of how to use the PDF upload middleware in a route handler
// exports.createBookWithPdf = asyncHandler(async (req, res, next) => {
//   // Use the uploadBookPdf middleware to handle PDF upload
//   exports.uploadBookPdf(req, res, async (err) => {
//     if (err) {
//       return next(err);
//     }

//     // Save the PDF filename in the req.body
//     if (req.file) {
//       req.body.pdf = req.file.filename;
//     }

//     // Now you can continue with your logic to create a book
//     try {
//       const newBook = await Book.create(req.body);
//       res.status(201).json({
//         status: "success",
//         data: {
//           book: newBook,
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         status: "fail",
//         message: error.message,
//       });
//     }
//   });
// });
