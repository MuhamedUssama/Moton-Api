const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
const pageImage = require("../models/pageImageModel");

//upload single image
exports.uploadpageImage = uploadSingleImage("image");

//image processing
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `pageImage-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .toFormat("jpeg")
      .toFile(`uploads/pageImage/${filename}`);

    //req.body.imageUrl = `/api/categories/${filename}`; //update the image url in

    //save image into database
    req.body.image = filename;
  }

  next();
});

//@Description -->   Create pageImage
//@Route -->         POST /api/v1/pageimage
//@Access -->        Admin
exports.createpageImage = factory.createOne(pageImage);

//@Description -->   Update pageImage
//@Route -->   PUT /api/v1/pageimage/id:
//@Access -->  Admin
exports.updatepageImage = factory.updateOne(pageImage);

//@Description -->   Delete pageImage
//@Route -->   DELETE /api/v1/pageimage/id:
//@Access -->  Admin
exports.deletepageImage = factory.deleteOne(pageImage);
