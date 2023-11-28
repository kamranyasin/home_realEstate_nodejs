const express = require("express");
const {isAuthenticatedUser} = require('../middleware/auth')
const {loginUser, logOut, createAgent, userDetail, getAllAgents, getSingleAgent, updateAgent, deleteAgent} = require('../controller/userController');
const multer = require('multer');
const upload = require('../middleware/agentUpload')






const router = express.Router();

router.route("/login").post(loginUser, isAuthenticatedUser);

router.route("/createAgent").post(upload.array('medias'), createAgent);

router.route("/user/detail/:id").get(userDetail);

router.route("/allAgents").get(getAllAgents);

router.route("/agents/agent/:id").get(getSingleAgent)

router.route("/agents/agent/delete/:id").delete(deleteAgent)

router.route("/agents/updateAgents/:id").put(upload.array('medias'), updateAgent)

router.route("/user/logout").get(logOut)




module.exports = router