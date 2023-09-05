var multer = require("multer");
const path = require("path");
const helpers = require("../helpers/pdfFilter");

class pdfFile {
  postPDF(req, res) {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/pdfs");
      },
      // By default, multer removes file extensions so let's add them back
      filename: function (req, file, cb) {
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    // 'pdfFile' is the name of our file input field in the HTML form
    let upload = multer({
      storage: storage,
      fileFilter: helpers.pdfFilter,
    }).single("pdf");

    //console.log("Entro bien");

    upload(req, res, function (err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any

      if (req.fileValidationError) {
        return res.send(req.fileValidationError);
      } else if (!req.file) {
        return res.send("Please select an PDF to upload");
      } else if (err instanceof multer.MulterError) {
        return res.send(err);
      } else if (err) {
        return res.send(err);
      }

      // Display uploaded image for user validation
      res.status(200).json({
        data: req.body,
      });
    });
  }
}

const pdfFileObject = new pdfFile();
module.exports = pdfFileObject;
