const { createevent, editevent, deleteevent, getevents } = require("../controllers/Events")
const { protectadmin } = require("../middleware/middleware")

const router = require("express").Router()
const upload = require("../middleware/upload")

const uploadimg = upload.single("image")


router
 .post("/createevent", protectadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    createevent)
 .post("/editevent", protectadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    editevent)
 .get("/deleteevent", protectadmin, deleteevent)
 .get("/getevents", getevents)

module.exports = router