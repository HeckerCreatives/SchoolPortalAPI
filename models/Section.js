const { default: mongoose } = require("mongoose");



const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    status: {
        type: String,
        default: "active",
    },
    gradelevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gradelevel"
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
    },
    schoolyear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schoolyear"
    },
    students: [{
        studentid: {
            type: mongoose.Schema.Types.ObjectId
        },
        studentusername: {
            type: String,
        },
        firstname: {
            type: String,
        },
        middlename: {
            type: String,
        },
        lastname: {
            type: String,
        }
    }]
})


const Section = mongoose.model("Section", SectionSchema)
module.exports = Section