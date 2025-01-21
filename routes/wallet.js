const { getwallet } = require("../controllers/wallet")
const { protectstudent, protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getstudentwallet", protectstudent, getwallet)
 .get("/getstaffuserwallet", protectstaffusers, getwallet)

module.exports = router