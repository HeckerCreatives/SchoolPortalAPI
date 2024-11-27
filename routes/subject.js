const { createSubject } = require("../controllers/Subject")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .post("/createsubject", protectsuperadmin, createSubject)

module.exports = router

