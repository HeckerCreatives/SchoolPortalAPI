const { createsection, getAllSections, editSection, deleteSection } = require("../controllers/section")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createsection", protectsuperadmin, createsection)
.get("/getallsections", protectsuperadmin, getAllSections)
.post("/editsection", protectsuperadmin, editSection)
.get("/deletesection", protectsuperadmin, deleteSection)

module.exports = router