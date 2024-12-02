const { createSchedule, getSchedulesByTeacher, getSchedulesBySection, editSchedule  } = require("../controllers/schedule")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createschedule", protectsuperadmin, createSchedule)
.post("/editschedule", protectsuperadmin, editSchedule)
.get("/getschedulebyteacher", protectsuperadmin, getSchedulesByTeacher)
.get("/getschedulebysection", protectsuperadmin, getSchedulesBySection)

module.exports = router