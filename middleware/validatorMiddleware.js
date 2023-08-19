const { validationResult } = require("express-validator");

//2-middleware => catch errors from rules if exist
//find the validation errors in this request and wraps them in an object with handy functions
//abl ma adkhol fe el database to improve my app performance
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validatorMiddleware;
