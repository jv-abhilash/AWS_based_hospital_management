const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

//Routes

router.post("/",appointmentController.createAppointments);
router.get("/:patientId",appointmentController.getPatientAppointments);
router.patch("/:appointmentId/status",appointmentController.updateAppointmentStatus);

module.exports = router