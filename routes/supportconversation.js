const { createconversation, Staffgetconversation, getmessages, matchstaffuserwithconversation, disconnectstaffuserwithconversation, createticketuserconversation, createstudentuserconversation, studentgetconversation, ticketgetconversation } = require("../controllers/supportconversation")
const { protectsuperadmin, protectticket, protectstudent } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createconversation", createconversation)
.get("/getmessages", getmessages)
.post("/createticketuserconversation", protectticket, createticketuserconversation)
.post("/createstudentuserconversation", protectstudent, createstudentuserconversation)
.post("/matchstaffuserwithconversation", protectsuperadmin, matchstaffuserwithconversation)
 .get("/disconnectstaffuserwithconversation", disconnectstaffuserwithconversation)
 .get("/Staffgetconversation", protectsuperadmin, Staffgetconversation)
 .get("/studentgetconversation", protectstudent, studentgetconversation)
 .get("/ticketgetconversation", protectticket, ticketgetconversation)



 module.exports = router 