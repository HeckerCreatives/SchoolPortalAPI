const { createschoolyear, setCurrentSchoolYear, getSchoolYear } = require("../controllers/schoolyear")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createschoolyear", protectsuperadmin, createschoolyear)
.get("/setcurrentschoolyear", protectsuperadmin, setCurrentSchoolYear)
.get("/getschoolyear", protectsuperadmin, getSchoolYear)

module.exports = router