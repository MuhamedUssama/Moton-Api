const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

const User = require("../models/userModel");

//@Description -->   Make sure user is logged in or not
exports.prodect = asyncHandler(async (req, res, next) => {
  // 1- check if token exist, if exixt get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }

  if (!token) {
    return next(
      new ApiError("You are not login, please login and try again", 401)
    );
  }

  // 2-verify token (no change happend, expierd token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3- check if user exists
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token doesn't longer exist",
        401
      )
    );
  }

  // 4- check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recentely changed his password, please login again",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

//@Description -->   Permissions
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- access roles
    // 2- access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

//@Description -->   Signup
//@Route -->   POST /api/v1/auth/signup
//@Access -->  user
exports.signup = asyncHandler(async (req, res, next) => {
  //1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  //2-Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  // 3. Send the token as a response
  res.status(201).json({
    data: user,
    token,
  });
});

//@Description -->   Login
//@Route -->   Get /api/v1/auth/login
//@Access -->  user
exports.login = asyncHandler(async (req, res, next) => {
  //1-check if email and password in the body
  //2-check if user exixt & password is correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  //3-generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  //4- send response to client side
  res.status(200).json({
    data: user,
    token,
  });
});

//@Description -->   Forgot Password
//@Route -->   POST /api/v1/auth/forgotPassword
//@Access -->  user
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user for this email: ${req.body.email}`, 404)
    );
  }
  // 2- if user exist, Generate hash reset random 6 digits, And save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;

  //password reset code will expired after 10 mins
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerrified = false;

  await user.save();

  const message = `Hi, ${user.name}, \nWe recieved a request to reset the password on yout Moton account \n${resetCode} \nEnter this code to complete the reset.\nThanks for helping us keep you account secure.`;

  // 3- send the reset code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 mins)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerrified = undefined;

    await user.save();

    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

//@Description -->   Verify Password reset code
//@Route -->   POST /api/v1/auth/verifyResetCode
//@Access -->  Admin
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1- Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2- Reset code valid
  user.passwordResetVerrified = true;
  await user.save();
  res.status(200).json({
    status: "Success",
  });
});

//@Description -->   Reset Password
//@Route -->   POST /api/v1/auth/resetPassword
//@Access -->  User
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user for this email: ${req.body.email}`, 404)
    );
  }
  // 2- Check if reset code verified
  if (!user.passwordResetVerrified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  // 3- update password and make other fields undefined
  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerrified = undefined;

  await user.save();

  // 4- If every thing good, generate a new token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  res.status(200).json({ token });
});
