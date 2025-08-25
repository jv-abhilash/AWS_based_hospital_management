const mongoose = require('mongoose');

// Define the schema for a doctor added new in server-side which is a schema
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    department: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

// Compile model from schema
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
