const express = require("express");
const {isAuthenticatedUser} = require('../middleware/auth')
const {createProperty, getProperties, getUserProperties, updateProperty, getProperty, getUserProperty, deleteProperty} = require('../controller/propertiesController');
const propertiesUpload = require('../middleware/propertiesUpload')

const router = express.Router();


router.route("/createProperty/:id").post(propertiesUpload.array('media'), createProperty);
//
router.route("/agent/properties/:id").get(getProperties);
//
router.route("/agents/properties/:slug").get(getProperty)

router.route("/agents/property/delete/:slug").delete(deleteProperty)

router.route("/properties/updateProperty/:user/:slug").put(propertiesUpload.array('media'), updateProperty)




// userside --route
router.route("/properties").get(getUserProperties);
router.route("/properties/:slug").get(getUserProperty);


module.exports = router