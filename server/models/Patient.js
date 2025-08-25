const mongoose = require('mongoose');

// Counter Schema
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 4999 }
});

const Counter = mongoose.model('Counter', counterSchema);


// Patient Schema
const patientSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: false,
        index: true
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    email:{ type:String, required:true },
    phoneNumber: { type: String, required: true },
    treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' }]
});


patientSchema.pre('save', async function(next) {
    console.log("Pre-save hook triggered.");

    if (this.isNew) {
        console.log("New document, attempting to set id...");
        try {
            const result = await Counter.findByIdAndUpdate(
                'patientId',
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            console.log("Counter update result:", result);
            if (!result) {
                throw new Error('Counter document could not be found or created.');
            }
            this.id = result.seq;
        } catch (error) {
            console.error('Error updating counter:', error);
            return next(error);
        }
    }
    next();
});

// Initialize Counter at app start
async function initializeCounter() {
    console.log("Initializing Counter...");
    const initId = 'patientId';
    try {
        const counter = await Counter.findById(initId);
        if (!counter) {
            console.log("Counter not found, creating new one...");
            await new Counter({ _id: initId, seq: 4999 }).save();
            console.log("Counter initialized.");
        } else {
            console.log("Counter already exists:", counter);
        }
    } catch (error) {
        console.error("Failed to initialize counter:", error);
    }
}


const Patient = mongoose.model('Patient', patientSchema);

module.exports = { Patient, initializeCounter };