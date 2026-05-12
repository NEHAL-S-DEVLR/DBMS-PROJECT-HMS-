const express = require("express");
const router = express.Router();

const { reqappointment } = require("../controllers/reqappointmentController");
const { updateAppointmentStatus } = require("../controllers/updateAppointmentStatusController");
const {docupdatestatus } = require("../controllers/docupdatestatusController");
const { deleteaccount } = require("../controllers/deleteaccountContoller");
const { sendmessage } = require("../controllers/sendmessageController");
const { deleteChat } = require("../controllers/deleteChatController");


router.post("/reqappointment", reqappointment);
router.post("/appointmentstatus", updateAppointmentStatus);
router.post("/docupdatestatus", docupdatestatus);
router.post("/deleteaccount",deleteaccount);
router.post("/sendmessage",sendmessage);
router.delete("/deletechat", deleteChat);

module.exports = router;