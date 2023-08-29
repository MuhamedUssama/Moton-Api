const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./handlersFactory");

const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

//@Description -->   Create cash order
//@Route -->         POST /api/v1/order/cartId
//@Access -->        Logged User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const shippingPrice = 0;
  const taxPrice = 0;

  // 1- Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id: ${req.params.cartId}`, 404)
    );
  }

  // 2- Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- Create order with defult paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4- After craeting order, decrement books quantity and increment books sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.book },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Book.bulkWrite(bulkOption, {});

    // 5- Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);

    //get cout of sales books
  }

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
//@Description -->   Get All Orders
//@Route -->         GET /api/v1/order
//@Access -->        Logged Admin - Publishers - User
exports.getAllOeders = factory.getAll(Order);

//@Description -->   Get Specific Order
//@Route -->         GET /api/v1/order
//@Access -->        Logged Admin - Publishers - User
exports.getSpecificOrder = factory.getOne(Order);

//@Description -->   Get Total Sales Achieved
//@Route -->         GET /api/v1/order/totalSales
//@Access -->        Logged Admin
exports.getTotalSalesAchieved = asyncHandler(async (req, res, next) => {
  // Check if the current user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }

  // Calculate the total sales achieved
  const totalSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalOrderPrice" },
      },
    },
  ]);

  const totalSalesAchieved = totalSales.length ? totalSales[0].totalSales : 0;

  res.status(200).json({ status: "success", data: { totalSalesAchieved } });
});

//@Description -->   Update Order Paid Status to paid
//@Route -->         PUT /api/v1/order/:id/pay
//@Access -->        Logged Admin
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError("There is no order for this user"), 404);
  }

  //update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

//@Description -->   Update Order Delivered Status
//@Route -->         PUT /api/v1/order/:id/deliver
//@Access -->        Logged Admin
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError("There is no order for this user"), 404);
  }

  //update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});
