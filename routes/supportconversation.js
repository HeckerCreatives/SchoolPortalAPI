const { createconversation, Staffgetconversation, getmessages, matchstaffuserwithconversation, disconnectstaffuserwithconversation } = require("../controllers/supportconversation")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .post("/createconversation", createconversation)
 .post("/matchstaffuserwithconversation", protectsuperadmin, matchstaffuserwithconversation)
 .get("/disconnectstaffuserwithconversation", disconnectstaffuserwithconversation)
 .get("/Staffgetconversation", protectsuperadmin, Staffgetconversation)
 .get("/getmessages", getmessages)



 module.exports = router 