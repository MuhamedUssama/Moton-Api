const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

//@Description -->   Add Book to wishlist
//@Route -->         POST /api/v1/wishlist
//@Access -->        Logged User
exports.addBookToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.bookId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Book added succsisfully to your wishlist",
    data: user.wishlist,
  });
});

//@Description -->   Remove Book from wishlist
//@Route -->         DELETE /api/v1/wishlist/:bookId
//@Access -->        Logged User
exports.removeBookFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.bookId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Book removed succsisfully from your wishlist",
    data: user.wishlist,
  });
});

//@Description -->   Get Logged User wishlist
//@Route -->         GET /api/v1/wishlist
//@Access -->        Logged User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
