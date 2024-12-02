const { getAllGradelevels, deletegradelevel, editgradelevel, creategradelevel, gradelevellist, getGradeLevelByProgram } = require("../controllers/gradelevel")

const router = require("express").Router()

router
.get("/getallgradelevel", getAllGradelevels)
.get("/getgradelevelbyprogram", getGradeLevelByProgram)
.get("/gradelevellist", gradelevellist)
.post("/creategradelevel", creategradelevel)
.post("/editgradelevel", editgradelevel)
.get("/deletegradelevel", deletegradelevel)

module.exports = router;