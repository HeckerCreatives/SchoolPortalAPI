const { getstudentsubjectgrade, createsubjectgrade, getsubjectgradestudent, getsubjectgradebystudentid } = require("../controllers/subjectgrade")
const { protectteacheradviser, protectstudent, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getstudentsubjectgrade", protectteacheradviser, getstudentsubjectgrade)
 .post("/createsubjectgrade", protectsuperadmin, createsubjectgrade)
 .get("/getsubjectgradebystudentidta", protectteacheradviser, getsubjectgradebystudentid)

 .get("/getsubjectgradestudent", protectstudent, getsubjectgradestudent)

 .get("/getsubjectgradebystudentidsa", protectsuperadmin, getsubjectgradebystudentid)


module.exports = router