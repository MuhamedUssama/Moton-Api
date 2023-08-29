const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title required"],
      minLength: [3, "Too short title"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: { type: String, required: [true, "Image required"] },

    address: {
      type: String,
      required: [true, "Address is Required"],
    },

    date: {
      type: Date,
      required: [true, "Date is Required"],
    },

    details: {
      type: String,
      required: [true, "Details are Required"],
    },

    description: {
      type: String,
      required: [true, "Description  is Required"],
    },

    form: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        name: {
          type: String,
          required: [true, "Name field is required"],
        },
        email: {
          type: String,
          required: [true, "Email field is required"],
        },
        phone_number: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  //return image url + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/events/${doc.image}`;
    doc.image = imageUrl;
  }
};

//find & update
eventSchema.post("init", (doc) => {
  setImageURL(doc);
});

//create
eventSchema.post("save", (doc) => {
  setImageURL(doc);
});

const EventModel = mongoose.model("Event", eventSchema);

module.exports = EventModel;
