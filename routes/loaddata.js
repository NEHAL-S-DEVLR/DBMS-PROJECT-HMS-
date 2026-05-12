const express = require("express");
const router = express.Router();

const { doclist } = require("../controllers/doclistController");
const { patientlist } = require("../controllers/patientlistController");
const {appointmentlist} = require("../controllers/appointmentlistController");
const {userappointmentlist} = require("../controllers/userappointmentlistController");
const { userprofile } = require("../controllers/userprofileController");
const { loadMessages } = require("../controllers/loadmessagesController");

router.get("/doctorlist", doclist);
router.get("/patientlist",patientlist);
router.get("/appointmentlist",appointmentlist);
router.get("/userappointmentlist",userappointmentlist);
router.get("/userprofile",userprofile);
router.get("/loadmessages",loadMessages);

module.exports = router;