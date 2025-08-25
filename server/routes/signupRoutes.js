const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signupController");

//Routes
router.post("/",signupController.signup);

module.exports = router