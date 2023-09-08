const stripe = require("stripe")(process.env.Stripe_Secret);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./handlersFactory");

const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { initPayment, createOrder, createPaymentKey, checkIfOrderPaid } = require("./paymob.services");
const PaymobToken = require("../models/paymobTokens");
const { createPaypalPayment, executePaypalPayment } = require("./paypal");

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

//@Description -->   Get checkout session from stripre and send it as response
//@Route -->         GET /api/v1/order/checkout-session/cartId
//@Access -->        Logged User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  //app setting
  const shippingPrice = 0;
  const taxPrice = 0;

  const paymentGetaway = req.query.payment_getaway
  const availablePaymentGetaways = ['paypal', 'paymob']
  if (!availablePaymentGetaways.includes(paymentGetaway))
    return next(new ApiError("Please specify the payment getaway"), 400);

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

  // 3- create stripe checkout session

  const book = await Book.findById(cart.cartItems[0].book); // Assuming there's one book in the cart

  if (!book) {
    return next(
      new ApiError(
        `The book associated with this cart could not be found.`,
        404
      )
    );
  }

  if (paymentGetaway === 'paymob') {
    const totalOrderPriceAsCents = parseInt(totalOrderPrice * 100);
    const token = await initPayment();
    console.log(token)
    const paymobOrderId = await createOrder(token, totalOrderPriceAsCents, `${cart._id.toString()} ${Date.now()}`);
    const paymentKey = await createPaymentKey(token, totalOrderPriceAsCents, paymobOrderId, process.env.PAYMOB_INTEGRATION_ID);

    const paymobToken = new PaymobToken({
      token,
      orderId: paymobOrderId,
      cart: cart._id,
    })
    await paymobToken.save();
    res.status(200).json({ status: "success", session: paymentKey });
  }
  if (paymentGetaway === 'paypal') {
    const paymentUrl = await createPaypalPayment(totalOrderPrice, 'USD', cart._id)
    res.status(200).json({ status: "success", session: paymentUrl });
  }
  // 4- send session to response
});

const createCardOrder = async (cartId, orderPrice) => {
  // const cartId = session.client_reference_id;
  // const orderPrice = session.amount_total / 100;
  // const shippingAddress = session.metadata;

  const cart = await Cart.findById(cartId);

  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id: ${req.params.cartId}`, 404)
    );
  }
  //create order
  const order = await Order.create({
    user: cart.user,
    cartItems: cart.cartItems,
    // shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
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
    await Cart.findByIdAndDelete(cartId);
  }
};

exports.createPaymobOrder = asyncHandler(async (req, res, next) => {
  const { transactionId, orderId } = req.query;

  if (!transactionId || !orderId) {
    return next(new ApiError("There is no order with this id"), 404);
  }
  const paymobToken = await PaymobToken.findOne({ orderId });
  if (!paymobToken) {
    return next(new ApiError("There is no order with this id"), 404);
  }

  const token = paymobToken.token;

  const { isSuccess, amount_cents } = await checkIfOrderPaid(token, transactionId);
  if (!isSuccess) {
    return next(new ApiError("There is no order with this id"), 404);
  }

  createCardOrder(paymobToken.cart, amount_cents / 100);

  res.status(200).json({ status: "success", data: "Order created successfully" });
})
exports.createPaypalOrder = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.query;

  const payment = await executePaypalPayment(paymentId);

  if (!payment) {
    return next(new ApiError("There is no order with this id"), 404);
  }

  const cartId = payment?.transactions[0]?.description;
  const orderPrice = payment?.transactions[0]?.amount?.total;

  createCardOrder(cartId, orderPrice);

  res.status(200).json({ status: "success", data: "Order created successfully" });
})


exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // create order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ recived: true });
});
