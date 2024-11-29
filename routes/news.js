const { createnews, editnews, deletenews, getnews } = require("../controllers/News")
const { protectadmin } = require("../middleware/middleware")

const router = require("express").Router()
const upload = require("../middleware/upload")

const uploadimg = upload.single("image")


router
 .post("/createnews", protectadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    createnews)
 .post("/editnews", protectadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    editnews)
 .get("/deletenews", protectadmin, deletenews)
 .get("/getnews", getnews)

module.exports = router