const { getnotifications } = require("../controllers/notification")
const { protectstudent, protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router

.get("/getstudentnotification", protectstudent, getnotifications)
.get("/getstaffnotification", protectstaffusers, getnotifications)

module.exports = router