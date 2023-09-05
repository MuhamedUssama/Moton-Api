const mongoose = require("mongoose");

const pdfFileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  uploadDate: Date,
  length: Number,
});

const PdfFile = mongoose.model("PdfFile", pdfFileSchema);

module.exports = PdfFile;
