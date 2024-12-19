const { createSchedule, getSchedulesByTeacher, getSchedulesBySection, editSchedule, deletschedule, getSchedulesTeacher  } = require("../controllers/schedule")
const { protectsuperadmin, protectteacheradviser, protectstudent } = require("../middleware/middleware")

const router = require("express").Router()

router

// #region SUPERADMIN

.post("/createschedule", protectsuperadmin, createSchedule)
.post("/editschedule", protectsuperadmin, editSchedule)
.get("/getschedulebyteacher", protectsuperadmin, getSchedulesByTeacher)
.get("/getschedulebysection", protectsuperadmin, getSchedulesBySection)
.get("/deleteschedule", protectsuperadmin, deletschedule)
// #endregion


// #region TEACHER

.get("/getteacherschedule", protectteacheradviser, getSchedulesTeacher)

// #endregion


//#region STUDENT

.get("/getschedulebysectionst", protectstudent, getSchedulesBySection)

//#endregion
module.exports = router