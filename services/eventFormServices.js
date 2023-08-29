const asyncHandler = require("express-async-handler");
const Event = require("../models/eventModel");

//@Description -->   Add Form data to Event form
//@Route -->         POST /api/v1/eventform/:eventId
//@Access -->        Logged User

exports.addEventForm = asyncHandler(async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Find the event by its ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const formData = req.body; // User's form information from the request body

    // Find the event by its ID and update the form array
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { form: formData } },
      { new: true }
    );

    // Respond with a success message and the updated form array
    res.status(200).json({
      status: "success",
      message: "Event form added successfully to your form group",
      data: updatedEvent.form,
    });
  } catch (error) {
    // Handle errors here
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the request",
    });
  }
});
