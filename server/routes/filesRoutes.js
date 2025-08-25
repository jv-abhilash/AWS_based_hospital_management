const express = require("express");
const router = express.Router();
const filesController = require("../controllers/filesController");

//Routes
router.post("/upload",filesController.uploadFiles, filesController.handleUpload);
router.get("/viewURL",filesController.viewFiles);
router.get("/download",filesController.downloadFiles);
router.get("/:appointmentId",filesController.fetchFilesByAppointmentID);

module.exports = router