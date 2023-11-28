const catchAsyncError = (asyncFunction) => (req, res, next) => {
  Promise.resolve(asyncFunction(req, res, next)).catch(next);
};

module.exports = catchAsyncError;
