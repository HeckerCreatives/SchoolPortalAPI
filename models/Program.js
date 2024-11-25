const { default: mongoose } = require("mongoose");


const ProgramSchema = new mongoose.Schema({
    name: {
        type: String,
    }
})


const Program = mongoose.model("Program", ProgramSchema)
module.exports = Program