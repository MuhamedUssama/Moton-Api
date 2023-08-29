const express = require("express");

const authServices = require("../services/authServices");

const {
  addBookToWishlist,
  removeBookFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistServices");

const router = express.Router();

router
  .route("/")
  .post(authServices.prodect, authServices.allowedTo("user"), addBookToWishlist)
  .get(
    authServices.prodect,
    authServices.allowedTo("user"),
    getLoggedUserWishlist
  );

router.delete(
  "/:bookId",
  authServices.prodect,
  authServices.allowedTo("user"),
  removeBookFromWishlist
);

module.exports = router;
