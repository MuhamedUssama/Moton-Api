const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

//@Description -->   Add Adress to User addresses
//@Route -->         POST /api/v1/addresses
//@Access -->        Logged User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Adress added succsisfully to your addresses group",
    data: user.addresses,
  });
});

//@Description -->   Remove Adress from User addresses
//@Route -->         DELETE /api/v1/addresses/:addressId
//@Access -->        Logged User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Adress removed succsisfully from your addresses group",
    data: user.addresses,
  });
});

//@Description -->   Get Logged User addresses
//@Route -->         GET /api/v1/addresses
//@Access -->        Logged User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
