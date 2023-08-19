const { check, body } = require("express-validator");
const slugify = require("slugify");
const mongoose = require("mongoose");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModels");

exports.createBookValidator = [
  check("bookName")
    .notEmpty()
    .withMessage("Book name required")
    .isLength({ min: 2 })
    .withMessage("Too short book name")
    .isLength({ max: 100 })
    .withMessage("Too long book name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("authorName")
    .notEmpty()
    .withMessage("Author name required")
    .isLength({ min: 2 })
    .withMessage("Too short author name")
    .isLength({ max: 64 })
    .withMessage("Too long author name"),

  check("price")
    .notEmpty()
    .withMessage("Book price required")
    .isNumeric()
    .withMessage("Book price must be a number"),

  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Book priceAfterDiscount is must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than book price");
      }
      return true;
    }),

  check("delivaryPrice")
    .optional()
    .isNumeric()
    .withMessage("delivaryPrice must be a number"),

  check("publisherName")
    .notEmpty()
    .withMessage("Book publisher is required")
    .isLength({ min: 2 })
    .withMessage("Too short for book publisher")
    .isLength({ max: 64 })
    .withMessage("Too long for book publisher"),

  check("publicationDate")
    .notEmpty()
    .withMessage("Book publication date is required"),

  check("numberOfCovers")
    .notEmpty()
    .withMessage("Book number of covers is required"),

  check("editionOfBook")
    .notEmpty()
    .withMessage("Book edition of book is required"),

  check("description")
    .notEmpty()
    .withMessage("Book description is required")
    .isLength({ min: 20 })
    .withMessage("Too short for book description"),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Book quantity must be a number"),

  check("image").notEmpty().withMessage("Book image is required"),

  check("bookSize").notEmpty().withMessage("Book size is required"),

  check("category")
    .notEmpty()
    .withMessage("Book must belong to a category")
    .custom(async (categoryId) => {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error(`Invalid category ID: ${categoryId}`);
      }
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error(`No category found for ID: ${categoryId}`);
      }
    }),

  check("type")
    .notEmpty()
    .withMessage("Type required")
    .isIn(["paper", "electronic"])
    .withMessage("Invalid Type"),

  check("language")
    .notEmpty()
    .withMessage("Language required")
    .isIn(["arabic", "english"])
    .withMessage("Invalid language"),

  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),

  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),

  validatorMiddleware,
];

exports.getBookValidator = [
  check("id").isMongoId().withMessage("Invalid book id"),
  validatorMiddleware,
];

exports.updateBookValidator = [
  check("id").isMongoId().withMessage("Invalid book id"),
  body("bookName")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBookValidator = [
  check("id").isMongoId().withMessage("Invalid book id"),
  validatorMiddleware,
];
