const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

//Nested Route
//GET /api/v1/books/:bookId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.bookId) filterObject = { book: req.params.bookId };
  req.filterObj = filterObject;
  next();
};

//@Description -->   Get list of Reviews
//@Route -->   GET /api/v1/reviews
//@Access -->  User
exports.getReviews = factory.getAll(Review);

//@Description -->   Get specific Review by id
//@Route -->   GET /api/v1/reviews/ :id
//@Access -->  User
exports.getReview = factory.getOne(Review);

//Nested Route
exports.setBookIdAndUserIdToBody = (req, res, next) => {
  //Nested Route (Create)
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

//@Description -->   Create Review
//@Route -->   POST /api/v1/reviews
//@Access -->  User
exports.createReview = factory.createOne(Review);

//@Description -->   Update Review
//@Route -->   PUT /api/v1/reviews/id:
//@Access -->  User
exports.updateReview = factory.updateOne(Review);

//@Description -->   Delete Review
//@Route -->   DELETE /api/v1/reviews/id:
//@Access -->  User/Admin/can deactive user
exports.deleteReview = factory.deleteOne(Review);
