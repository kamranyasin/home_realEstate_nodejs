const express = require("express");
const {createProject, updateProject, getProjects, getProject, getAllProjects, getOneProject} = require('../controller/projectController')
const projectUpload = require("../middleware/projectUpload.js");


const router = express.Router();


router.route("/createProject/:id").post(
    projectUpload.fields([
      { name: "images", maxCount: 10 },
      { name: "blue_print_images", maxCount: 10 }, 
    ]),
    createProject
);

router.put(
  "/project/updateProject/:slug",
  projectUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "blue_print_images", maxCount: 10 },
  ]),
  updateProject
);

// admin side
router.route("/project/Allprojects/:id").get(getProjects);
router.route("/project/project/:slug").get(getProject);


// userside
router.route("/user/Allprojects/").get(getAllProjects);
router.route("/user/project/:slug").get(getOneProject);


module.exports = router