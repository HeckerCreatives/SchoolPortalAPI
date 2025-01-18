const { createassignment, submitassignment, getassignments } = require("../controllers/assignment")
const { protectteacheradviser, protectstudent } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createassignment", protectteacheradviser, createassignment)
.get("/getassignmentsteacher", protectteacheradviser, getassignments)
.post("/submitassignment", protectstudent, submitassignment)
.get("/getassignmentsstudent", protectstudent, getassignments)


module.exports = router