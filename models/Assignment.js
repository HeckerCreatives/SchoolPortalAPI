const { default: mongoose } = require("mongoose");




const AssignmentSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subjects"
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sections"
        },
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
        },
        title: {
            type: String,
            index: true,
        },
        description: {
            type: String,
            index: true,
        },
        duedate: {
            type: String,
            index: true,
        },
        submissions: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Students"
                },
                file: {
                    type: String,
                },
                answer: {
                    type: String
                }
            }
        ]
    },
    {
        timestamps: true,
    }
)


const Assignment = mongoose.model("Assignment", AssignmentSchema)
module.exports = Assignment

