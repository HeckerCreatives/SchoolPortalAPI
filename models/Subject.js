const { default: mongoose } = require("mongoose");


const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    day: {
        type: String,
    },
    starttime: {
        type: String,
    },
    endtime: {
        type: String
    },
    status: {
        type: Boolean,
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    },
    schoolyear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schoolyear"
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gradelevel"
    }
})

const Subject = mongoose.model("Subject", SubjectSchema)
module.exports = Subject