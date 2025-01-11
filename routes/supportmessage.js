const { anonymoussendmessage, staffsendmessage } = require("../controllers/supportmessages")
const { protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router
 .post("/anonymoussendmessage", anonymoussendmessage)
 .post("/staffsendmessage", protectstaffusers, staffsendmessage)


module.exports = router