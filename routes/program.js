const router = require("express").Router()
const { getAllPrograms, CreateProgram, DeleteProgram, EditProgram, getProgramEnrollmentSchedules } = require("../controllers/program");
const { protectsuperadmin } = require("../middleware/middleware");


router
.get("/getallprogram", getAllPrograms)
.get("/deleteprogram", protectsuperadmin, DeleteProgram)
.post("/createprogram", protectsuperadmin, CreateProgram)
.post("/editprogram", protectsuperadmin, EditProgram)

//landing page
.get("/getallprogramsenrollmentschedule", getProgramEnrollmentSchedules)

module.exports = router;