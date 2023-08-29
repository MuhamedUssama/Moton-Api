const mongoose = require("mongoose");
const Book = require("./bookModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: [true, "review required"],
      // unique: [true, "Must be unique"],
      // minLength: [3, "Too short review name"],
      // maxLength: [50, "Too long review name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    ratings: {
      type: Number,
      min: [1, "Min rating value is 1.0"],
      max: [5, "Max rating value is 5.0"],
      required: [true, "Review must have rating."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user."],
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: [true, "Review must belong to book."],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

reviewSchema.statics.calcAverageRatingAndQuantity = async function (bookId) {
  const result = await this.aggregate([
    // Stage 1 : get all reviews in specific book
    { $match: { book: bookId } },
    // Stage 2 : Grouping reviews based on bookId and calculate average rating and quantity
    {
      $group: {
        _id: "book",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  // console.log(result);

  if (result.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.book);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.book);
});

module.exports = mongoose.model("Review", reviewSchema);
