const { getAllGradelevels, deletegradelevel, editgradelevel, creategradelevel, gradelevellist } = require("../controllers/gradelevel")

const router = require("express").Router()

router
.get("/getallgradelevel", getAllGradelevels)
.get("/gradelevellist", gradelevellist)
.post("/creategradelevel", creategradelevel)
.post("/editgradelevel", editgradelevel)
.get("/deletegradelevel", deletegradelevel)

module.exports = router;