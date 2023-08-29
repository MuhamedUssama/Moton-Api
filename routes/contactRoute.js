const express = require("express");

const {
  getContactValidator,
  createContactValidator,
  deleteContactValidator,
} = require("../utils/validator/contactValidator");

const {
  getContacts,
  getContact,
  createContact,
  deleteContact,
} = require("../services/contactServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .get(authServices.prodect, authServices.allowedTo("admin"), getContacts)
  .post(
    authServices.prodect,
    authServices.allowedTo("user"),
    createContactValidator,
    createContact
  );
router
  .route("/:id")
  .get(
    authServices.prodect,
    authServices.allowedTo("admin"),
    getContactValidator,
    getContact
  )
  .delete(
    authServices.prodect,
    authServices.allowedTo("admin"),
    deleteContactValidator,
    deleteContact
  );

module.exports = router;
