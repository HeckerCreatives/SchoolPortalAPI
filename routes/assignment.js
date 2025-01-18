const { createassignment, submitassignment, getassignments } = require("../controllers/assignment")
const { protectteacheradviser, protectstudent } = require("../middleware/middleware")
const upload = require("../middleware/upload")

const uploadimg = upload.single("file")


const router = require("express").Router()

router
.post("/createassignment", protectteacheradviser, createassignment)
.get("/getassignmentsteacher", protectteacheradviser, getassignments)
.post("/submitassignment", protectstudent, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })
}, submitassignment)
.get("/getassignmentsstudent", protectstudent, getassignments)


module.exports = router