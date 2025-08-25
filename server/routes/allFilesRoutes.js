const express = require("express");
const router = express.Router();
const allFilesController = require("../controllers/allFilesController");

//Routes
router.get("/patient/by-username/:username",allFilesController.getPatientsAllFilesByUserName);
router.get("/patient/:patientId",allFilesController.getAllFilesByID);
router.get("/viewURLpatient",allFilesController.viewAllFilesOnline);
router.get("/downloadpatient",allFilesController.downloadPatientAllFile);

module.exports = router