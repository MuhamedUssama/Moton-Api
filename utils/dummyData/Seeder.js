const fs = require("fs");
// eslint-disable-next-line import/no-extraneous-dependencies
require("colors");
const dotenv = require("dotenv");
const Book = require("../../models/bookModel");
const dbConnection = require("../../config/database");

dotenv.config({ path: "../../config.env" });

//db Connection
dbConnection();

//Read data
const books = JSON.parse(fs.readFileSync("./book.json"));

//Insert data into db
const insertData = async () => {
  try {
    await Book.create(books);
    console.log("Data inserted".blue.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//Delete data from db
const deleteData = async () => {
  try {
    await Book.deleteMany();
    console.log("Data deleted".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
