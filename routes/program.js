const { getAllGradelevels } = require("../controllers/gradelevel");
const { getAllPrograms } = require("../controllers/program");

const router = require("express").Router()

router
 .get("/getallprogram", getAllPrograms)

module.exports = router;