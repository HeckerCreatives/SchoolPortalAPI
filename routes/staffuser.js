const { staffuserlist, banunbanstaffuser, editStaffUserDetails, editStaffRole } = require("../controllers/staffuser")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/staffuserlist", protectsuperadmin, staffuserlist)
 .get("/banunbanstaffuser", protectsuperadmin, banunbanstaffuser)
 .post("/editstaffuserdetails", protectsuperadmin, editStaffUserDetails)
 .post("/editstaffrole", protectsuperadmin, editStaffRole)

module.exports = router