const { createconversation, Staffgetconversation, getmessages } = require("../controllers/supportconversation")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .post("/createconversation", createconversation)
 .get("/Staffgetconversation", protectsuperadmin, Staffgetconversation)
 .get("/getmessages", getmessages)

 module.exports = router 