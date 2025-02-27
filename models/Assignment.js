const { default: mongoose } = require("mongoose");


const AssignmentSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffusers"
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
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
            type: Date,
            index: true,
        },
        maxscore: {
            type: Number,
            index: true,
        },
        submissions: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Studentusers"
                },
                file: {
                    type: String,
                },
                answer: {
                    type: String
                },
                score: {
                    type: Number,
                },
                status: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ]
    },
    {
        timestamps: true,
    }
)


const Assignment = mongoose.model("Assignment", AssignmentSchema)
module.exports = Assignment

