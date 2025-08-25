const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController")

//Routes

router.get('/',adminController.getUsers);
router.get('/search',adminController.searchUsers);
router.patch('/:userId/role',adminController.updateRoles);

module.exports = router