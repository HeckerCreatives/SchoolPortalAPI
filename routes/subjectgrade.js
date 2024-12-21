const { getstudentsubjectgrade, createsubjectgrade, getsubjectgradestudent } = require("../controllers/subjectgrade")
const { protectteacheradviser, protectstudent } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getstudentsubjectgrade", protectteacheradviser, getstudentsubjectgrade)
 .post("/createsubjectgrade", protectteacheradviser, createsubjectgrade)
 
 .get("/getsubjectgradestudent", protectstudent, getsubjectgradestudent)

 
module.exports = router