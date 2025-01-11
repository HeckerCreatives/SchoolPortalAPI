const { createconversation, Staffgetconversation, getmessages } = require("../controllers/supportconversation")

const router = require("express").Router()

router
 .post("/createconversation", createconversation)
 .get("/Staffgetconversation", Staffgetconversation)
 .get("/getmessages", getmessages)

 module.exports = router 