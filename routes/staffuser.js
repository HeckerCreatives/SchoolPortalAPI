const { staffuserlist } = require("../controllers/staffuser")

const router = require("express").Router()

router
 .get("/staffuserlist", staffuserlist)

module.exports = router