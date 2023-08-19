const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: [true, "Book name required"],
      minLength: [2, "Too short book name"],
      maxLength: [100, "Too long book name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    authorName: {
      type: String,
      required: [true, "Author name required"],
      minLength: [2, "Too short author name"],
      maxLength: [64, "Too long author name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Book price required"],
      trim: true,
    },
    priceAfterDiscount: {
      type: Number,
    },
    quantity: {
      type: Number,
      trim: true,
    },

    delivaryPrice: {
      type: Number,
      trim: true,
    },
    publisherName: {
      type: String,
      required: [true, "Book publisher is required"],
      minLength: [2, "Too short for book publisher"],
      maxLength: [64, "Too long for book publisher"],
      trim: true,
    },
    publicationDate: {
      type: Date,
      required: [true, "Book publication date is required"],
      trim: true,
    },
    numberOfCovers: {
      type: String,
      required: [true, "Book number of covers is required"],
      trim: true,
    },
    editionOfBook: {
      type: String,
      required: [true, "Book edition of book is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Book description is required"],
      minLength: [20, "Too short for book description"],
    },

    sold: {
      //3dd el kotob aly atba3t
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    bookSize: {
      type: String,
      required: [true, "Book size is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Book must be belong to category"],
    },
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
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    pdf: {
      data: Buffer, // Store the PDF file content
      contentType: String, // Store the content type (e.g., "application/pdf")
      // required: true,
    },
  },
  { timestamps: true }
);

bookSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name-_id",
  });
  next();
});

// Create a text index on 'bookName' and 'description'
bookSchema.index(
  { bookName: "text", description: "text" },
  { default_language: "none" }
);

const setImageURL = (doc) => {
  //return image url + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/books/${doc.image}`;
    doc.image = imageUrl;
  }
};

//find & update
bookSchema.post("init", (doc) => {
  setImageURL(doc);
});

//create
bookSchema.post("save", (doc) => {
  setImageURL(doc);
});

const BookModel = mongoose.model("Book", bookSchema);

module.exports = BookModel;
