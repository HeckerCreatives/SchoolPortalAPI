const { default: mongoose } = require("mongoose");



const SubjectGradeSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subjects"
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffusers"
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers"
        },
        quarter: {
            type: String
        },
        grade: {
            type: Number,
        },
        remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

const Subjectgrade = mongoose.model("Subjectgrade", SubjectGradeSchema)
module.exports = Subjectgrade