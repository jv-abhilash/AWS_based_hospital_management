const {Patient}  = require('../models/Patient');

// Defining all the CRUD for patient details
//Create a patient
exports.createPatient = async (req, res) => {
    const { name, age, address, phoneNumber,email } = req.body;
    // Check if all required fields are provided
    if (!name || !age || !address || !phoneNumber || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    try {
      // Create a new patient instance
      const newPatient = new Patient({ name, age, address, phoneNumber,email });
      await newPatient.save();  // Save the new patient to the database
  
      // SNS topics you want to subscribe the email to
      const topics = {
        "appointment": "arn:aws:sns:us-east-1:992382740511:appointment",
        "notification": "arn:aws:sns:us-east-1:992382740511:Notification",
        "record-h": "arn:aws:sns:us-east-1:992382740511:record-h"
      };
  
      // Subscribe patient's email to each topic with filtering options
      for (const [key, topicArn] of Object.entries(topics)) {
        const params = {
          Protocol: 'email',
          TopicArn: topicArn,
          Endpoint: email,
          Attributes: {
            FilterPolicy: JSON.stringify({ "patientId": [newPatient.id.toString()] })
          }
        };
        // Using the correct snsClient with the SubscribeCommand
        const subscribeCommand = new SubscribeCommand(params);
        await snsClient.send(subscribeCommand);
      }
  
      res.status(201).json(newPatient); // Return the newly created patient
    } catch (err) {
      console.error('Failed to save the patient:', err);
      res.status(400).json({ message: err.message });
    }
};
  
 

//Get all Patient Details
exports.getPatientDetails = async (req, res) => {
      try {
          const patients = await Patient.find();
          res.json(patients);
      } catch (err) {
          res.status(500).json({ message: err.message });
      }
};
 
//Search the patient Record by ID
exports.getPatientById =  async (req, res) => {  
      const id = req.params.id;
      //console.log(req.params);
      try {
          const patient = await Patient.findOne({ id: id });
          if (!patient) {
              return res.status(404).json({ message: "Patient not found" });
          }
          res.json(patient);
      } catch (err) {
          console.error('Error fetching patient:', err);
          res.status(500).json({ message: err.message });
      }
};
  

//Update the Patient Record
exports.updatePatient =  async (req, res) => {
      try {
          const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
          res.json(updatedPatient);
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
};
  
//Deletion of Patient Record  
exports.deletePatient = async(req, res) => {
    res.status(403).json({ message: 'Deletion of patient records is disabled.' });
};