const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");

exports.uploadPdf = (fieldName) => {
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/pdfs");
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split("/")[1];
      const filename = `pdf-${uuidv4()}-${Date.now()}.${ext}`;
      cb(null, filename);
    },
  });

  const multerFilter = function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new ApiError("Only PDF files allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload.single(fieldName);
};
