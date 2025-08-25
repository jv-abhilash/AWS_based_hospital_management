const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const mongoose = require('mongoose');
const File = require("../models/File")

// Create a new doctor
exports.createDoctors =  async (req, res) => {
    try {
        const { name, department, phoneNumber, email } = req.body;
        const newDoctor = new Doctor({ name, department, phoneNumber, email });
        await newDoctor.save();
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
  };
  
// Get all doctors
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
  // Update a doctor
exports.updateDoctors =  async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
  
// Delete a doctor
exports.deleteDoctors =  async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
//DocDetails.js
exports.getPatientsforDoctor = async (req, res) => {
    const { doctorId } = req.params;
    console.log('The doctorId:',doctorId);
    try {
      const results = await Appointment.aggregate([
          { $match: { doctorId: new mongoose.Types.ObjectId(doctorId), status: 'completed' }},
          { $group: { _id: '$patient' }},
          { $lookup: {
              from: 'patients',
              localField: '_id',
              foreignField: 'id',
              as: 'patientDetails'
          }},
          { $unwind: '$patientDetails' },
          { $project: { _id: 0, patient: '$patientDetails' }}
      ]);
  
      console.log("The result is:",results);
  
      if (results.length === 0 ) {
          return res.status(200).json({ message: 'No patients found for this doctor with completed appointments.' });
      }
      res.json(results.map(item => item.patient));
  } catch (error) {
      console.error('Failed to retrieve patients:', error);
      res.status(500).json({ message: 'Error fetching patients' });
  }
};
  
exports.getFilesforDoctor = async (req, res) => {
    const { doctorId, patientId } = req.params;
  
    try {
      // First, retrieve all relevant appointment IDs
      const appointments = await Appointment.find({
        doctorId: doctorId,
        patient: patientId,
        status: 'completed'
      }).select('_id'); // We only need the _id field for the next query
      console.log('The appointments are',appointments);
      if (!appointments.length) {
        return res.status(200).json({ message: 'No completed appointments found for this doctor and patient.' });
      }
      // Extract just the IDs for use in the next query
      const appointmentIds = appointments.map(appointment => appointment._id);
      // Now, fetch files associated with these appointment IDs
      const files = await File.find({
        appointmentId: { $in: appointmentIds }
      });
      console.log("The files are:",files);
      if (!files.length) {
        return res.status(200).json({ message: 'No files found for these appointments.' });
      }
      res.json(files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      res.status(500).json({ message: 'Server error while fetching files.' });
    }
};  