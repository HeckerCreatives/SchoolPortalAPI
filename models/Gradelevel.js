const { default: mongoose } = require("mongoose");


const GradeLevelSchema = new mongoose.Schema(
    {
        level: {
            type: String,
        },
        program: {
            type: mongoose.Schema.Types.ObjectId, // nursery, pre-school, elementary, junior-high-school and senior-high-school
            ref: "Program"
        }
    },
    {
        timestamps: true
    }
)

const Gradelevel = mongoose.model("Gradelevel", GradeLevelSchema)
module.exports = Gradelevel