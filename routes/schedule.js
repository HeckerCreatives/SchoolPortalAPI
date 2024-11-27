const { createSchedule, getSchedules } = require("../controllers/schedule")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createschedule", protectsuperadmin, createSchedule)
.get("/getschedule", protectsuperadmin, getSchedules)

module.exports = router