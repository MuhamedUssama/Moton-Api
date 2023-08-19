const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
const factory = require("./handlersFactory");
const uploadPdf = require("../middleware/uploadPdfMiddleware");
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

// exports.uploadBookPdf = uploadPdf.single("pdf");

// exports.uploadSinglePdf = (fieldName) => {
//   //1- DiskStorage engine
//   const multerStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "uploads/pdf");
//     },
//     filename: function (req, file, cb) {
//       const ext = file.mimetype.split("/")[1];
//       const filename = `pdf-${uuidv4()}-${Date.now()}.${ext}`;
//       cb(null, filename);
//     },
//   });
// }

//@Description -->   Get list of Books
//@Route -->   GET /api/v1/books
//@Access -->  User
exports.getBooks = factory.getAll(Book, "books");

//@Description -->   Get specific Book by id
//@Route -->   GET /api/v1/books/ :id
//@Access -->  User
exports.getBook = factory.getOne(Book);

//@Description -->   Create Book
//@Route -->   POST /api/v1/books
//@Access -->  Admin || Publisher
exports.createBook = factory.createOne(Book);

//@Description -->   Update Book
//@Route -->   PUT /api/v1/books/id:
//@Access -->  Admin || Publisher
exports.updateBook = factory.updateOne(Book);

//@Description -->   Delete Book
//@Route -->   DELETE /api/v1/books/id:
//@Access -->  Admin || Publisher
exports.deleteBook = factory.deleteOne(Book);
