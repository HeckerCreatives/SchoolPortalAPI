const { CreateExamSchedule, getExamSchedules, selectExamSchedules } = require("../controllers/examschedule")
const { protectticket, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createexamschedule", protectsuperadmin, CreateExamSchedule)
.get("/getexamschedule", protectsuperadmin, getExamSchedules)
.get("/selectexamschedule", protectticket, selectExamSchedules)

module.exports = router