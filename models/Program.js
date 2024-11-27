const { default: mongoose } = require("mongoose");


const ProgramSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)


const Program = mongoose.model("Program", ProgramSchema)
module.exports = Program