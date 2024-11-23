const { CreateExamSchedule, getExamSchedules, selectExamSchedules, EditExamSchedule } = require("../controllers/examschedule")
const { protectticket, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createexamschedule", protectsuperadmin, CreateExamSchedule)
.post("/editexamschedule", protectsuperadmin, EditExamSchedule)
.get("/getexamschedule", getExamSchedules)
.get("/selectexamschedule", protectticket, selectExamSchedules)

module.exports = router