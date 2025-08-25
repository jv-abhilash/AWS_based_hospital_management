const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    appointmentId: {  // Reference from appointment
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileHash:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedDate: {
        type: Date,
        default: Date.now
    }
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
