const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "./storage/project/");
  },
  filename(req, file, callback) {
    const fileName =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .toLowerCase()
        .replace(/\s+/g, "-") +
      "-" +
      Date.now().toString() +
      path.extname(file.originalname).toLowerCase();
    callback(null, fileName);
  },
});

const projectUpload = multer({ storage });

module.exports = projectUpload;
