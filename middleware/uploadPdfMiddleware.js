const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../utils/ApiError");

// Define storage for PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "pdfs"); // Specify the directory where PDFs will be saved
  },
  filename: (req, file, cb) => {
    const uniqueName = `pdf-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

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

// Define file filter for PDFs
// const pdfFileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("pdf")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Only PDF files are allowed", 400), false);
//   }
// };

// Create the multer upload instance for PDFs
const uploadPdf = multer({ storage: pdfStorage });

module.exports = uploadPdf;
