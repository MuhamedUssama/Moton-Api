const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfService = require("../services/pdfServices"); // Path to your PdfService

const upload = multer();

router.post("/upload", upload.single("pdf"), async (req, res) => {
  const { originalname, mimetype } = req.file;
  const pdfStream = createReadStream(req.file.buffer);
  const pdfFile = await pdfService.uploadPdf(originalname, mimetype, pdfStream);
  res.json(pdfFile);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const pdfFile = await pdfService.getPdfFileById(id);
  if (!pdfFile) {
    return res.status(404).json({ message: "PDF file not found" });
  }
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
  const downloadStream = bucket.openDownloadStream(mongoose.Types.ObjectId(id));
  res.set("Content-Type", pdfFile.contentType);
  downloadStream.pipe(res);
});

router.get("/list", async (req, res) => {
  const pdfFiles = await pdfService.getAllPdfFiles();
  res.json(pdfFiles);
});

module.exports = router;
