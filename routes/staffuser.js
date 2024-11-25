const { staffuserlist, banunbanstaffuser, editStaffUserDetails } = require("../controllers/staffuser")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/staffuserlist", protectsuperadmin, staffuserlist)
 .get("/banunbanstaffuser", protectsuperadmin, banunbanstaffuser)
 .post("/editstaffuserdetails", protectsuperadmin, editStaffUserDetails)

module.exports = router