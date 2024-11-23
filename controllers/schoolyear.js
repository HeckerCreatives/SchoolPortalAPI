const { default: mongoose } = require("mongoose")
const Schoolyear = require("../models/Schoolyear")


exports.createschoolyear = async (req, res) => {
    const { id } = req.user
    const { startyear, endyear } = req.body

    if(!startyear || !endyear){
        return res.status(400).json({ message: "failed", data: "Please input start year and end year"})
    }

    await Schoolyear.create({
        owner: new mongoose.Types.ObjectId(id),
        startyear: startyear,
        endyear: endyear,
        status: "inactive"
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while creating school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.setCurrentSchoolYear = async (req, res) => {
    const { id } = req.query

    // delete all ticket users if changed current school year

    await Schoolyear.findOneAndUpdate(
        { currentstatus: "current" },
        { $set: { currentstatus: "inactive" } },
        { new: true } 
    )
    .catch(err => {
        console.log(`There's a problem while updating the previous school year to inactive. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    await Schoolyear.findByIdAndUpdate(
            id,
            { $set: { currentstatus: "current" } },
            { new: true } 
        )
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem while updating the new current school year. Error ${err}`)
            return res.status(404).json({ message: "failed", data: "School year with the provided ID not found." });
        })

    return res.status(200).json({ message: "success" })
}

exports.getSchoolYear = async (req, res) => {

    const schoolyeardata = await Schoolyear.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success", data: schoolyeardata})
}

exports.getCurrentSchoolYear = async (req, res) => {

    const schoolyeardata = await Schoolyear.findOne({ currentstatus: "current"})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success", data: schoolyeardata})
}

