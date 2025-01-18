const { createsection, getAllSections, editSection, deleteSection, getSectionByGradeLevel, selectSection, getstudentlistbysubjectsection, sectionlistofteacher, studentlistbysectionid, getstudentsubjects, studentlistbysectionidteacher, getstudentsubjectsteacher, getSubjectListBySection, getSubjectListByStudent, getSubjectListByTeacher } = require("../controllers/section")
const { protectsuperadmin, protectstudent, protectteacheradviser, protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router

// #region SUPERADMIN

.post("/createsection", protectsuperadmin, createsection)
.get("/getallsections", protectsuperadmin, getAllSections)
.get("/getsectionbygradelevel", protectsuperadmin, getSectionByGradeLevel)
.post("/editsection", protectsuperadmin, editSection)
.get("/deletesection", protectsuperadmin, deleteSection)
.get("/getstudentsubjectsa", protectsuperadmin, getstudentsubjects)

//#endregion


// #region STUDENT

.get("/getsectionbygradelevelst", protectstudent, getSectionByGradeLevel)
.post("/selectsection", protectstudent, selectSection)
.get("/getsubjectlistbystudent", protectstudent, getSubjectListByStudent)
//#endregion



// #region TEACHER
.get("/getsubjectlistbyteacher", protectteacheradviser, getSubjectListByTeacher)
.get("/sectionlistofteacher", protectteacheradviser, sectionlistofteacher)
.get("/getstudentlistbysubjectsection",protectteacheradviser, getstudentlistbysubjectsection)
.get("/getstudentsubjectta", protectteacheradviser, getstudentsubjectsteacher)
.get("/studentlistbysectionidteacher", protectstaffusers, studentlistbysectionidteacher)



// #endregion


// #region STAFFUSERS
.get("/getsubjectlistbysection", protectstaffusers, getSubjectListBySection)
.get("/studentlistbysectionid", protectstaffusers, studentlistbysectionid)

// #endregion

module.exports = router