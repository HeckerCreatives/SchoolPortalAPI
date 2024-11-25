const { getAllGradelevels } = require("../controllers/gradelevel")

const router = require("express").Router()

router
 .get("/getallgradelevel", getAllGradelevels)

module.exports = router;