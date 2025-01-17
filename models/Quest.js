const { default: mongoose } = require("mongoose");


const QuestSchema = new mongoose.Schema(
    {
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
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
        expirationDate: {
            type: Date, 
        },
    },
    { timestamps: true }
);

const Quest = mongoose.model("Quest", QuestSchema)
module.exports = Quest
