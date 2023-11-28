const express = require("express");
const {createBlog, getBlogs, getBlog, updateBlog, getUserBlogs, getUserBlog} = require('../controller/blogController')
const uploadBlogs = require('../middleware/blogUploads')


const router = express.Router();


router.route("/createBlog/:id").post(uploadBlogs.fields([{name: 'image'}, {name: 'images'}]), createBlog)

router.route("/updateBlog/:slug").put(uploadBlogs.fields([{name: 'image'}, {name: 'images'}]), updateBlog);

// admin side
router.route("/Allblogs/:id").get(getBlogs);
router.route("/Allblogs/blog/:slug").get(getBlog);



router.route("/user/Allblogs").get(getUserBlogs);
router.route("/userblogs/blog/:slug").get(getUserBlog);


module.exports = router