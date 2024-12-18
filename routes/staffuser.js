const { staffuserlist, getteacherlist, banunbanstaffuser, editStaffUserDetails, editStaffRole, getUserDetails } = require("../controllers/staffuser")
const { protectsuperadmin, protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/staffuserlist", protectsuperadmin, staffuserlist)
 .get("/banunbanstaffuser", protectsuperadmin, banunbanstaffuser)
 .post("/editstaffuserdetails", protectsuperadmin, editStaffUserDetails)
 .post("/editstaffrole", protectsuperadmin, editStaffRole)
 .get("/getteacherlist", protectsuperadmin, getteacherlist)


 .get("/getuserdetails", protectstaffusers, getUserDetails)


module.exports = router