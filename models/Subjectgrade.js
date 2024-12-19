const { default: mongoose } = require("mongoose");



const SubjectGradeSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subjects"
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
        }
    },
    {
        timestamps: true,
    }
)

const Subjectgrade = mongoose.model("Subjectgrade", SubjectGradeSchema)
module.exports = Subjectgrade