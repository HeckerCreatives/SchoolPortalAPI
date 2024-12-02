const { createschoolyear, setCurrentSchoolYear, getSchoolYear, getCurrentSchoolYear } = require("../controllers/schoolyear")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createschoolyear", protectsuperadmin, createschoolyear)
.get("/getschoolyear", protectsuperadmin, getSchoolYear)
.get("/getcurrentschoolyear", protectsuperadmin, getCurrentSchoolYear)
module.exports = router