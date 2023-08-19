const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Must be unique"],
      minLength: [3, "Too short category name"],
      maxLength: [50, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: { type: String, required: [true, "Image required"] },
    type: {
      type: String,
      enum: ["paper", "electronic"],
      required: [true, "Type required"],
    },
    language: {
      type: String,
      enum: ["arabic", "english"],
      required: [true, "Language required"],
    },
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  //return image url + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/category/${doc.image}`;
    doc.image = imageUrl;
  }
};

//find & update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});

//create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
