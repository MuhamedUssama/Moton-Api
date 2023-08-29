const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");

//upload single image
exports.uploadUserImage = uploadSingleImage("profileImage");

//image processing
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(700, 1000)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/user/${filename}`);

    //req.body.imageUrl = `/api/categories/${filename}`; //update the image url in

    //save image into database
    req.body.profileImage = filename;
  }

  next();
});

//@Description -->   Get list of Users
//@Route -->   GET /api/v1/users
//@Access -->  Admin
exports.getUsers = factory.getAll(User);

//@Description -->   Get specific User by id
//@Route -->   GET /api/v1/users/ :id
//@Access -->  Admin
exports.getUser = factory.getOne(User);

//@Description -->   Create User
//@Route -->   POST /api/v1/users
//@Access -->  Admin
exports.createUser = factory.createOne(User);

//@Description -->   Update User
//@Route -->   PUT /api/v1/users/id:
//@Access -->  Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});
//@Description -->   Delete User
//@Route -->   DELETE /api/v1/users/id:
//@Access -->  Admin
exports.deleteUser = factory.deleteOne(User);

//@Description -->   Get logged user data
//@Route -->   GET /api/v1/users/ getMe
//@Access -->  Admin - User who is logn in
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

//@Description -->   Update logged user password
//@Route -->   PUT /api/v1/users/ updateMyPassword
//@Access -->  Admin - User who is logn in
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1- update user password based on (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2- Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  res.status(200).json({ date: user, token });
});

//@Description -->   Update logged user data (without password or role)
//@Route -->   PUT /api/v1/users/ updateMe
//@Access -->  Admin - User who is logn in
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});

//@Description -->   Deactivate logged user
//@Route -->   DELETE /api/v1/users/ deleteMe
//@Access -->  Admin - User who is logn in
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "Success" });
});
