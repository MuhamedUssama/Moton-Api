/* eslint-disable no-undef */
const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const userModel = require("../../models/userModel");

exports.createContactValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid Email Format")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (!user.email) {
          return Promise.reject(new Error("Your Email not right"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone([
      "ar-AE", // United Arab Emirates
      "ar-SA", // Saudi Arabia
      "ar-EG", // Egypt
      "ar-IQ", // Iraq
      "ar-JO", // Jordan
      "ar-KW", // Kuwait
      "ar-LB", // Lebanon
      "ar-MA", // Morocco
      "ar-DZ", // Algeria
      "ar-TN", // Tunisia
      "en-US", // United States
      "zh-CN", // China
      "hi-IN", // India
      "es-MX", // Mexico
      "pt-BR", // Brazil
      "id-ID", // Indonesia
      "pa-PK", // Pakistan
      "bn-BD", // Bangladesh
      "ru-RU", // Russia
      "ja-JP", // Japan
    ])
    .withMessage("Invalid phone number"),

  validatorMiddleware,
];

exports.getContactValidator = [
  check("id").isMongoId().withMessage("Invalid Contact id"),
  validatorMiddleware,
];

exports.deleteContactValidator = [
  check("id").isMongoId().withMessage("Invalid Cantact id"),
  validatorMiddleware,
];
