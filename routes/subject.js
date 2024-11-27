const { createSubject, getSubjects } = require("../controllers/Subject")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createsubject", protectsuperadmin, createSubject)
.get("/getsubjects", protectsuperadmin, getSubjects)

module.exports = router

