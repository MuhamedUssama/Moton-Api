/* eslint-disable no-undef */
const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("reting value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating value must between 1 : 5"),
  check("user").isMongoId().withMessage("Invalid Review user id"),
  check("book")
    .isMongoId()
    .withMessage("Invalid Review book id")
    .custom((val, { req }) =>
      //check if logged user craete review before
      Review.findOne({ user: req.user._id, book: req.body.book }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error("You have already reviewed this Book")
            );
          }
        }
      )
    ),
  validatorMiddleware,
];

exports.getReviewValidator = [
  //1- rules
  check("id").isMongoId().withMessage("Invalid Review id"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id")
    .custom((val, { req }) =>
      //Check review owenrship before update
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`There is no review for this id: ${val} `)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are not allowed to perform this action`)
          );
        }
      })
    ),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id")
    .custom((val, { req }) => {
      //Check review owenrship before update
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review for this id: ${val} `)
            );
          }

          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`You are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
