const { default: mongoose } = require("mongoose");


const QuestSchema = new mongoose.Schema(
    {
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subjects"
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffuser"
        },
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignments"
        },
        title: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            index: true,
        },
        points: {
            type: Number,
            required: true,
            index: true, 
        },
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Expired'],
            default: 'Active',
        },
        duedate: {
            type: Date, 
        },
    },
    { timestamps: true }
);

const Quest = mongoose.model("Quest", QuestSchema)
module.exports = Quest
