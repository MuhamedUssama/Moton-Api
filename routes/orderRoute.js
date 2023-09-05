const express = require("express");

const {
  createCashOrder,
  getAllOeders,
  getSpecificOrder,
  filterOrderForLoggedUser,
  getTotalSalesAchieved,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderServieces");

const authServices = require("../services/authServices");

const router = express.Router();

router.get(
  "/checkout-session/:cartId",
  authServices.prodect,
  authServices.allowedTo("user"),
  checkoutSession
);

router
  .route("/:cartId")
  .post(authServices.prodect, authServices.allowedTo("user"), createCashOrder);

router.get(
  "/",
  authServices.prodect,
  authServices.allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getAllOeders
);

router.get(
  "/totalPrices",
  authServices.prodect,
  authServices.allowedTo("admin"),
  getTotalSalesAchieved
);

router.get(
  "/:id",
  authServices.prodect,
  authServices.allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getSpecificOrder
);

router.put(
  "/:id/pay",
  authServices.prodect,
  authServices.allowedTo("admin"),
  updateOrderToPaid
);

router.put(
  "/:id/deliver",
  authServices.prodect,
  authServices.allowedTo("admin"),
  updateOrderToDelivered
);

module.exports = router;
