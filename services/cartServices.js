const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");

const calcTotalCartPrice = (cart) => {
  let tatalPrice = 0;
  cart.cartItems.forEach((item) => {
    tatalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = tatalPrice;

  cart.totalPriceAfterDiscount = undefined;

  return tatalPrice;
};

//@Description -->   Add Book to cart
//@Route -->         POST /api/v1/cart
//@Access -->        User
exports.addBookToCart = asyncHandler(async (req, res, next) => {
  const { bookId } = req.body;
  const book = await Book.findById(bookId);
  // 1- Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for this logged user with book
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ book: bookId, price: book.price }],
    });
  } else {
    //if Book exixt in cart, update book quantity
    const bookIndex = cart.cartItems.findIndex(
      (item) => item.book.toString() === bookId
    );
    if (bookIndex > -1) {
      const cartItem = cart.cartItems[bookIndex];
      cartItem.quantity += 1;
      cart.cartItems[bookIndex] = cartItem;
    } else {
      //if not exixt, push Book to cartItem array
      cart.cartItems.push({ book: bookId, price: book.price });
    }
  }

  //calculate total cart price
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Book added to cart successfuly",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

//@Description -->   Get logged user cart
//@Route -->         GET /api/v1/cart
//@Access -->        User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id: ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

//@Description -->   Remove specific cart item
//@Route -->         DELETE /api/v1/cart/:itemId
//@Access -->        User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalCartPrice(cart);

  cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

//@Description -->   Remove all items from cart
//@Route -->         DELETE /api/v1/cart
//@Access -->        User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

//@Description -->   Update specific cart item quantity
//@Route -->         PUT /api/v1/cart/:itemId
//@Access -->        User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id: ${req.user._id}`, 404)
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There is no cart for this user id: ${req.user._id}`, 404)
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

//@Description -->   Apply Coupon on logged user cart
//@Route -->         PUT /api/v1/cart/applyCoupon
//@Access -->        User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1- Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError(`Coupon is invalid or expired`));
  }

  // 2- Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  const totalPrice = cart.totalCartPrice;

  // 3- Calculate price after price discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discout) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
