const { default: mongoose } = require("mongoose");



const ScheduleSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Types.ObjectId,
        ref: "Staffusers"
    },
    day: {
        type: String,
    },
    starttime: {
        type: String,
    },
    endtime: {
        type: String
    }
})

const Schedule = mongoose.model("Schedule", ScheduleSchema)
module.exports = Schedule