const { sendpoints, deletequest, updatequest } = require("../controllers/quest")
const { protectteacheradviser } = require("../middleware/middleware")

const router = require("express").Router()

router

.post("/sendpoints", protectteacheradviser, sendpoints)
.get("/deletequest", protectteacheradviser, deletequest)
.post("/updatequest", protectteacheradviser, updatequest)

module.exports = router