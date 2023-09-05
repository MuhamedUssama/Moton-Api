const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
// const { pdfFileObject } = require("../middleware/uploadPdfMiddleware"); // Import the PDF upload middleware
const { uploadPdf } = require("../middleware/pdf");

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

//@Description --> Create Book with PDF
//@Route --> POST /api/v1/books/pdf
//@Access --> Admin
exports.createBookWithPdf = asyncHandler(async (req, res, next) => {
  // Check if the request includes a PDF file
  if (req.file && req.file.fieldname === "pdf") {
    // Create a new book with the PDF file
    const newBook = new Book({
      // Add other book properties from req.body
      // ...
      pdf: req.file.filename, // Assuming you store the PDF file name in the 'pdf' field
    });

    try {
      await newBook.save();
      res.status(201).json({
        status: "success",
        data: {
          book: newBook,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  } else {
    // If no PDF file is included, return an error response
    return res.status(400).json({
      status: "fail",
      message: "PDF file is required for this operation.",
    });
  }
});

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
