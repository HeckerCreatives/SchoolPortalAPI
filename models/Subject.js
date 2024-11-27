const { default: mongoose } = require("mongoose");


const SubjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        status: {
            type: String,
            default: "active"
        },
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
        },
    },
    {
        timestamps: true
    }
)

const Subject = mongoose.model("Subject", SubjectSchema)
module.exports = Subject