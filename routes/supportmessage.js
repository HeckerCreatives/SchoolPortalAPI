const { anonymoussendmessage, staffsendmessage, userdisconnect, ticketsendmessage, studentsendmessage } = require("../controllers/supportmessages")
const { protectstaffusers, protectstudent, protectticket } = require("../middleware/middleware")

const router = require("express").Router()

router
 .post("/anonymoussendmessage", anonymoussendmessage)
 .post("/staffsendmessage", protectstaffusers, staffsendmessage)
 .post("/ticketsendmessage", protectticket, ticketsendmessage)
 .post("/studentsendmessage", protectstudent, studentsendmessage)
 .post("/userdisconnect", userdisconnect)


module.exports = router