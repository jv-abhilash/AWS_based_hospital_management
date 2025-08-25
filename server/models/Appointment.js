const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({ // An array of Patient Details
    patient: {
        type: Number,
        required: true,
        index: true,
        
    },
    doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true
        },

    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
        default: 'Scheduled'
    },
    appointmentType: {
        type: String,
        enum: ['Initial Assessment', 'Follow-Up'],
        required: true
    }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
