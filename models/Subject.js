const { default: mongoose } = require("mongoose");


const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    status: {
        type: String,
        default: "active"
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gradelevel"
    },
    schoolyear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schoolyear"
    },
})

const Subject = mongoose.model("Subject", SubjectSchema)
module.exports = Subject