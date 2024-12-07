const router = require("express").Router()
const { getAllPrograms, CreateProgram, getProgramEnrollmentSchedules } = require("../controllers/program");


router
.get("/getallprogram", getAllPrograms)
.post("/createprogram", CreateProgram)

//landing page
.get("/getallprogramsenrollmentschedule", getProgramEnrollmentSchedules)

module.exports = router;