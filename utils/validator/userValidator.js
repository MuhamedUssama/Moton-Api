/* eslint-disable no-undef */
const { check, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const userModel = require("../../models/userModel");

exports.createUserValidator = [
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
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password length is too short")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Passwords confirmation do not match");
      }
      return true;
    }),
  check("confirmPassword").notEmpty().withMessage("Confirm password requird"),
  check("profileImage").optional(),
  check("role").optional(),
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

exports.getUserValidator = [
  //1- rules
  check("id").isMongoId().withMessage("Invalid User id"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid Email Format")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      })
    ),
  check("profileImage").optional(),
  check("role").optional(),
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

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  body("currentPassword")
    .notEmpty()
    .withMessage("you must enter your current password"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("you must enter password confirm"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      //1- Virefy current password
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      //azai akaren ben password ma3mulu hashing in db w password ana ba3to 3ady fe el body
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Current password is incorrect");
      }

      //2- Virefy password confirm
      if (val !== req.body.confirmPassword) {
        throw new Error("Passwords confirmation do not match");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  validatorMiddleware,
];
