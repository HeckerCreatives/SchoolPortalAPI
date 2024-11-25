const { default: mongoose } = require("mongoose");



const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    status: {
        type: String,
    },
    gradelevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gradelevel"
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