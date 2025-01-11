const mongoose = require("mongoose");

const ClearanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Studentusers"
    },
    schoolyear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schoolyear"
    },
    clearanceStatus: [
        {
            department: { type: String, required: true },
            isCleared: { type: Boolean, default: false }, 
            remarks: { type: String, default: "" }, 
        }
    ],
}, { timestamps: true });

const Clearance = mongoose.model("Clearance", ClearanceSchema);
module.exports = Clearance;
