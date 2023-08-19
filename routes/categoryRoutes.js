const express = require("express");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryvalidator");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImages,
} = require("../services/categoryServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadCategoryImage,
    resizeImages,
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authServices.prodect,
    authServices.allowedTo("admin"),
    uploadCategoryImage,
    resizeImages,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
