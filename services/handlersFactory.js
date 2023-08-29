const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/ApiFeatures");
const Review = require("../models/reviewModel");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deletedDocument = await Model.findOneAndDelete({ _id: id });

    if (deletedDocument) {
      if (Model.modelName === "Review") {
        const bookId = deletedDocument.book;

        // Recalculate average ratings and quantity for the book
        await Review.calcAverageRatingAndQuantity(bookId); // Use Review model to call the method
      }

      res
        .status(200)
        .json({ item: `${deletedDocument._id} : successfully deleted` });
    } else {
      return next(new ApiError(`No Document for this id ${id}`, 404));
    }
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    document.save();

    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ status: "success", data: document });
  });

exports.getOne = (Model, populationOption) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1- Build query
    let query = Model.findById(id);
    if (populationOption) {
      query = query.populate(populationOption);
    }

    // 2- Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    //Build Query
    const documentCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentCounts)
      .filter()
      .limitFields()
      .sort();
    //Excute
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
