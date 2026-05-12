const express = require("express");
const router = express.Router();

const {
    allEMR,
    createEMR,
    allBilling,
    myBilling,
    createBilling,
    allStaff,
    createStaff,
    allMeetings,
    createMeeting,
    myTracker,
    createTracker,
} = require("../controllers/advancedController");

router.get("/emr", allEMR);
router.post("/emr", createEMR);

router.get("/billing", allBilling);
router.get("/mybilling", myBilling);
router.post("/billing", createBilling);

router.get("/staff", allStaff);
router.post("/staff", createStaff);

router.get("/meetings", allMeetings);
router.post("/meeting", createMeeting);

router.get("/mytracker", myTracker);
router.post("/tracker", createTracker);

module.exports = router;
