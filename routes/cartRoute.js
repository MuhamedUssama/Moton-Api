const express = require("express");

const {
  addBookToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .post(authServices.prodect, authServices.allowedTo("user"), addBookToCart)
  .get(authServices.prodect, authServices.allowedTo("user"), getLoggedUserCart)
  .delete(authServices.prodect, authServices.allowedTo("user"), clearCart);

router.put(
  "/applyCoupon",
  authServices.prodect,
  authServices.allowedTo("user"),
  applyCoupon
);

router
  .route("/:itemId")
  .delete(
    authServices.prodect,
    authServices.allowedTo("user"),
    removeSpecificCartItem
  )
  .put(
    authServices.prodect,
    authServices.allowedTo("user"),
    updateCartItemQuantity
  );

module.exports = router;
