const express = require("express");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
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
} = require("../services/userServices");

const authServices = require("../services/authServices");

const router = express.Router();

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(authServices.prodect, authServices.allowedTo("admin"), getUsers)
  .post(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadUserImage,
    resizeImages,
    createUserValidator,
    createUser
  );
router
  .route("/:id")
  .get(
    authServices.prodect,
    authServices.allowedTo("admin"),
    getUserValidator,
    getUser
  )
  .put(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadUserImage,
    resizeImages,
    updateUserValidator,
    updateUser
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
