const express = require("express");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  uploadUserImage,
  resizeImages,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../services/userServices");

const authServices = require("../services/authServices");

const router = express.Router();

router.get("/getMe", authServices.prodect, getLoggedUserData, getUser);
router.put("/changeMyPassword", authServices.prodect, updateLoggedUserPassword);
router.put(
  "/updateMe",
  authServices.prodect,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.delete("/deleteMe", authServices.prodect, deleteLoggedUserData);

// Admin
router.use(authServices.prodect, authServices.allowedTo("admin"));

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImages, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImages, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
