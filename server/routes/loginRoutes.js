const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController")


//Routes
router.post("/",loginController.login);

module.exports = router