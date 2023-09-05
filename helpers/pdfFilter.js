const pdfFilter = function (req, file, cb) {
  // Accept PDF only
  console.log("Hola");
  console.log(file.originalname);
  if (!file.originalname.match(/\.(pdf|PDF)$/)) {
    req.fileValidationError = "Only PDF files are allowed!";
    return cb(new Error("Only PDF files are allowed!"), false);
  }
  cb(null, true);
};
exports.pdfFilter = pdfFilter;
