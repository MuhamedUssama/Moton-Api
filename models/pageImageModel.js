const mongoose = require("mongoose");

const pageImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title required"],
      minLength: [3, "Too short title name"],
      maxLength: [50, "Too long title name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: { type: String, required: [true, "Image required"] },
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  //return image url + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/pageImage/${doc.image}`;
    doc.image = imageUrl;
  }
};

//find & update
pageImageSchema.post("init", (doc) => {
  setImageURL(doc);
});

//create
pageImageSchema.post("save", (doc) => {
  setImageURL(doc);
});

const pageImageModel = mongoose.model("pageImage", pageImageSchema);

module.exports = pageImageModel;
