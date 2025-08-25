const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

//Routes
router.post("/",doctorController.createDoctors);
router.get("/",doctorController.getDoctors);
router.put("/:id",doctorController.updateDoctors);
router.delete("/:id",doctorController.deleteDoctors);
router.get("/patients/:doctorId",doctorController.getPatientsforDoctor);
router.get("/files/:doctorId/patient/:patientId",doctorController.getFilesforDoctor)

module.exports = router