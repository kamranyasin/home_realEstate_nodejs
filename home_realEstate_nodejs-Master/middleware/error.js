const errorHandler = require("../utils/errorHandler.js");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server Error";

  //  Wrong mysql Id Error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new errorHandler(message, 400);
  }

  // mysql duplicate key errors
  if (err.code === 11000) {
    const message = `duplicate ${Object.keys(err.keyValue)} Entered`;

    err = new errorHandler(message, 400);
  }

  // Wrong JWT Web token
  if (err.code === "JsonWebTokenError") {
    const message = `Json web token is invalid, please try again`;

    err = new errorHandler(message, 400);
  }

  // JWT expires
  if (err.code === "TokenExpiredError") {
    const message = `Json web token is Expired, please try again`;

    err = new errorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
