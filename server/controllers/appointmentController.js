const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

//Creation of Appointments
exports.createAppointments =  async (req, res) => {
    const { patientId, doctors, date, status, type } = req.body;
    console.log("Received patientId:", patientId);
  
    try {
        // Validate the patient exists using the custom patientId
        const patientExists = await Patient.findOne({ id: patientId }); //For debugging Purpose
        console.log("Patient exists check:", patientExists);  //For Debugging pupose.
        if (!patientExists) {
            return res.status(404).json({ message: "Patient not found" });
        }
  
      
  
        // Creating a new appointment directly using custom ID 
        const newAppointment = new Appointment({
            patient: patientId, //custom ID for Patients
            doctorId: doctors, //MongoDB _id for doctors
            date,
            status,
            appointmentType: type
        });
  
      // Fetch the doctor's details
      const doctor = await Doctor.findById(doctors);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
  
        await newAppointment.save();
        
        //SNS service
        const params = {
          Message: `Your appointment on ${date} with ${doctor.name} is confirmed.`,
          TopicArn: 'arn:aws:sns:us-east-1:992382740511:appointment',
          MessageAttributes: {
            'patientId': {
              DataType: 'String',
              StringValue: patientId.toString()
            }
          }
      
        };
  
      try {
        const data = await snsClient.send(new PublishCommand(params));
        console.log("Message sent:", data.MessageId);
      } catch (error) {
        console.error("Error sending message:", error);
      }
        
        // Optionally include patient details in the response if necessary
        res.status(201).json(newAppointment);
    } catch (error) {
        console.error('Failed to create appointment:', error);
        res.status(400).json({ message: error.message });
    }
};
  
  
//Fetching the appointments for a particular patient
exports.getPatientAppointments = async (req, res) => {
    const patientId = req.params.patientId;
    const { status } = req.query; // Accept status as an optional query parameter
  
    let query = { patient: patientId };
    if (status) {
      query.status = status; // Add status to the query if it is provided
    }
  
    try {
        // Find all appointments where 'patient' field matches 'patientId'
        const appointments = await Appointment.find(query)
        .populate('patient')
        .populate({
          path: 'doctorId',
          select: 'name department' // Only fetch the name and department of the doctor
        });
        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this patient.' });
        }
        res.json(appointments);
    } catch (error) {
        console.error('Failed to retrieve appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};
  
// PATCH endpoint to update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;
  
    try {
        // Find the appointment by ID and update its status
        const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
  
        if (!updatedAppointment) {
            return res.status(404).send('Appointment not found');
        }
  
        res.json(updatedAppointment);
    } catch (error) {
        console.error('Failed to update appointment status:', error);
        res.status(500).send('Server error');
    }
};  