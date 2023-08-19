const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
const Category = require("../models/categoryModels");

//upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

//image processing
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(700, 1000)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/category/${filename}`);

    //req.body.imageUrl = `/api/categories/${filename}`; //update the image url in

    //save image into database
    req.body.image = filename;
  }

  next();
});

//@Description -->   Get list of Category
//@Route -->   GET /api/v1/categories
//@Access -->  User
exports.getCategories = factory.getAll(Category);

//@Description -->   Get specific Category by id
//@Route -->   GET /api/v1/categories/ :id
//@Access -->  User
exports.getCategory = factory.getOne(Category);

//@Description -->   Create Category
//@Route -->   POST /api/v1/categories
//@Access -->  Admin
exports.createCategory = factory.createOne(Category);

//@Description -->   Update Category
//@Route -->   PUT /api/v1/categories/id:
//@Access -->  Admin
exports.updateCategory = factory.updateOne(Category);

//@Description -->   Delete Category
//@Route -->   DELETE /api/v1/categories/id:
//@Access -->  Admin
exports.deleteCategory = factory.deleteOne(Category);
