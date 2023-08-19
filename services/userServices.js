const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
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
