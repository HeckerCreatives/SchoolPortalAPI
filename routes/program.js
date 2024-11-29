const router = require("express").Router()
const { getAllPrograms, CreateProgram } = require("../controllers/program");


router
.get("/getallprogram", getAllPrograms)
.get("/createprogram", CreateProgram)

module.exports = router;