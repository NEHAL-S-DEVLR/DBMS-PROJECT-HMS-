const express = require("express");
const router = express.Router();

const {
    createPrescription,
    allPrescriptions,
    myPrescriptions,
    createPharmacyOrder,
    allPharmacyOrders,
    myPharmacyOrders,
} = require("../controllers/medicalController");

router.post("/prescription", createPrescription);

router.get("/prescriptions", allPrescriptions);
router.get("/myprescriptions", myPrescriptions);

router.post("/pharmacyorder", createPharmacyOrder);

router.get("/pharmacyorders", allPharmacyOrders);
router.get("/mypharmacyorders", myPharmacyOrders);

module.exports = router;
