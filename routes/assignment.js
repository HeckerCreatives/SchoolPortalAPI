const { createassignment, submitassignment, getassignments, viewsubmissions, deletesubmission, addscore, deleteassignment, editassigment } = require("../controllers/assignment")
const { sendpoints } = require("../controllers/quest")
const { protectteacheradviser, protectstudent } = require("../middleware/middleware")
const upload = require("../middleware/upload")

const uploadimg = upload.single("file")


const router = require("express").Router()

router

// #region TEACHER

.post("/createassignment", protectteacheradviser, createassignment)
.post("/editassigment", protectteacheradviser, editassigment)
.post("/addscore", protectteacheradviser, addscore)
.get("/getassignmentsteacher", protectteacheradviser, getassignments)
.get("/viewsubmissions", protectteacheradviser, viewsubmissions)
.get("/deleteassigment", protectteacheradviser, deleteassignment)

// #endregion

// #region STUDENT

.post("/submitassignment", protectstudent, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })
}, submitassignment)
.get("/getassignmentsstudent", protectstudent, getassignments)
.get("/deletesubmission", protectstudent, deletesubmission)

// #endregion

module.exports = router