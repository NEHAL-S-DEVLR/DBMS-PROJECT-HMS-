const express = require("express");
const router = express.Router();

const { loginUser } = require("../controllers/loginController");
const { forgotpassword } = require("../controllers/forgotpasswordController");

router.post("/login", loginUser);
router.post("/forgotpassword", forgotpassword);

module.exports = router;
