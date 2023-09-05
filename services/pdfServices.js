const PdfFile = require("../models/pdfModel"); // Path to your PdfFile model
const { createReadStream } = require("fs");
const mongoose = require("mongoose"); // Remove the object destructuring here

class PdfService {
  async uploadPdf(filename, contentType, stream) {
    const pdfFile = new PdfFile({
      filename,
      contentType,
      uploadDate: new Date(),
    });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    const uploadStream = bucket.openUploadStream(pdfFile.filename);
    stream.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    pdfFile.length = uploadStream.bytesWritten;
    await pdfFile.save();
    return pdfFile;
  }

  async getPdfFileById(id) {
    return PdfFile.findById(id);
  }

  async getAllPdfFiles() {
    return PdfFile.find();
  }
}

module.exports = new PdfService();
