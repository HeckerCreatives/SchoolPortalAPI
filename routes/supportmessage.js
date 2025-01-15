const { anonymoussendmessage, staffsendmessage, userdisconnect } = require("../controllers/supportmessages")
const { protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router
 .post("/anonymoussendmessage", anonymoussendmessage)
 .post("/staffsendmessage", protectstaffusers, staffsendmessage)
 .post("/userdisconnect", userdisconnect)


module.exports = router