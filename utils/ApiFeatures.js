class ApiFeatures {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  filter() {
    const queryStringObject = { ...this.queryStr };
    const excludesFields = ["page", "sort", "limit", "fields"]; //4shan myzharush fe el url
    excludesFields.forEach((field) => delete queryStringObject[field]);

    //Apply filteration using [gte, gt, lte, lt]
    let queryStr = JSON.stringify(queryStringObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  // search() {
  //   if (this.queryStr.keyword) {
  //     const query = {};
  //     query.$or = [
  //       { bookName: { $regex: this.queryStr.keyword, $options: "i" } },
  //       { description: { $regex: this.queryStr.keyword, $options: "i" } },
  //     ];

  //     this.mongooseQuery = this.mongooseQuery.find(query);
  //   }
  //   return this;
  // }

  paginate(countDocuments) {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 12; // the number of books that will show in the page
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    //Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    //next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    //prev page
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
