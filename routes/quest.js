const { sendpoints } = require("../controllers/quest")
const { protectteacheradviser } = require("../middleware/middleware")

const router = require("express").Router()

router

.post("/sendpoints", protectteacheradviser, sendpoints)


module.exports = router