const express = require("express");

const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setBookIdAndUserIdToBody,
} = require("../services/reviewServices");

const authServices = require("../services/authServices");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    authServices.prodect,
    authServices.allowedTo("user"),
    setBookIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authServices.prodect,
    authServices.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin", "user"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
