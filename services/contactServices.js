const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const Contact = require("../models/contactModel");

//@Description -->   Get list of Contact Us Information
//@Route -->         GET /api/v1/contact
//@Access -->        Admin
exports.getContacts = factory.getAll(Contact);

//@Description -->   Get specific Contact Us Info by id
//@Route -->         GET /api/v1/contact/ :id
//@Access -->        Admin
exports.getContact = factory.getOne(Contact);

//@Description -->   Create Contact Us Info
//@Route -->         POST /api/v1/contact
//@Access -->        User
exports.createContact = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Combine the user ID with the request body data
  const contactData = {
    ...req.body,
    user: userId,
  };

  // Create a new contact using the combined data
  const contact = await Contact.create(contactData);

  // Respond with the created contact including the user ID
  res.status(201).json({ status: "success", data: contact });
});

//@Description -->   Delete Contact Us Information
//@Route -->         DELETE /api/v1/contact/id:
//@Access -->        Admin
exports.deleteContact = factory.deleteOne(Contact);
