const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImagesMiddleware");
const ApiError = require("../utils/ApiError");
const Event = require("../models/eventModel");

//upload single image
exports.uploadEventImage = uploadSingleImage("image");

//image processing
exports.resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `events-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(700, 1000)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/events/${filename}`);

    //req.body.imageUrl = `/api/categories/${filename}`; //update the image url in

    //save image into database
    req.body.image = filename;
  }

  next();
});

//@Description -->   Get list of Events
//@Route -->         GET /api/v1/events
//@Access -->        Public
exports.getEvents = factory.getAll(Event);

//@Description -->   Get specific Event by id
//@Route -->         GET /api/v1/events/ :id
//@Access -->        Public
exports.getEvent = factory.getOne(Event);

//@Description -->   Create Event
//@Route -->         POST /api/v1/events
//@Access -->        Admin
// exports.createEvent = factory.createOne(Event);

exports.createEvent = asyncHandler(async (req, res, next) => {
  // Extract all fields from the request body except 'form'
  const { form, ...eventData } = req.body;

  // Create a new event using the combined data
  const event = await Event.create(eventData);

  // Respond with the created event
  res.status(201).json({ status: "success", data: event });
});

//@Description -->   Update Event
//@Route -->         PUT /api/v1/events/id:
//@Access -->        Admin
exports.updateEvent = factory.updateOne(Event);

//@Description -->   Delete Event
//@Route -->         DELETE /api/v1/events/id:
//@Access -->        Admin
exports.deleteEvent = factory.deleteOne(Event);
