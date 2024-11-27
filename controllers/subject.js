const Schedule = require("../models/Schedule")
const Schoolyear = require("../models/Schoolyear")
const Subject = require("../models/Subject")


exports.createSubject = async (req, res) => {

    const { name } = req.body

    if(!name){
        return res.status(400).json({ message: "failed", data: "Please input subject name."})
    }

    const currentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for current school year in create subject. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    await Subject.create({
        name: name,
        schoolyear: currentSchoolYear._id
    })
    .then(async data => {
            await Schedule.create({
                subject: data._id,
                day: "",
                starttime: "",
                endtime: "",
            })
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem encountered while creating schedule in create subject. Error: ${err}`)
                return res.status(400).json({ message: "bad-request1", data: "There's a problem with the server. Please contact support for more details."})
            })
        return res.status(200).json({ message: "success"})
    })
    .catch(err => {
        console.log(`There's a problem encountred when creating subject. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
}

exports.selectsubjectdetails = async (req, res) => {
    
}
