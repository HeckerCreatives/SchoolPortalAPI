const { default: mongoose } = require("mongoose")
const Examschedule = require("../models/Examschedule")
const Schoolyear = require("../models/Schoolyear")


exports.CreateExamSchedule = async (req, res) => {
    const { starttime, endtime, date } = req.body

    if(!starttime || !endtime || !date){
        return res.status(400).json({ message: "failed", data: "Please input start time, end time and date"})
    }

    const currentschoolyear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching the current school year for exam schedule. Error: ${err}`)
        return res.status(400).json({ message: "failed", data: "There's a problem with the server. Please try again later."})
    })

    if(!currentschoolyear){
        return res.status(400).json({ message: "failed", data: "There's no existing school year."})
    }

    await Examschedule.create({
        starttime: starttime,
        endtime: endtime,
        date: date,
        schoolyear: currentschoolyear._id
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while creating exam schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getExamSchedules = async (req, res) => {
    const { page, limit } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }
    const matchCondition = [
        {
            $lookup: {
                from: "schoolyears", 
                localField: "schoolyear",
                foreignField: "_id",
                as: "schoolyearDetails"
            }
        },
        {
            $lookup: {
                from: "ticketusers", 
                localField: "examtakers.ticketuser",
                foreignField: "_id",
                as: "examtakerDetails"
            }
        },
        {
            $project: {
                starttime: 1,
                endtime: 1,
                date: 1,
                schoolyear: 1,
                schoolyearDetails: 1, 
                _id: 1,
                examtakers: 1,
                examtakerDetails: 1 
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit, 
        },
        {
            $limit: pageOptions.limit,
        },
    ];
    

    const examSchedulesData = await Examschedule.aggregate(matchCondition)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching requirements data. Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const totalDocuments = await Examschedule.countDocuments(matchCondition)

    
    const totalPages = Math.ceil(totalDocuments / pageOptions.limit)
    
    const finaldata = {
        totalPages: totalPages,
        data: []
    }

    examSchedulesData.forEach(temp => {
        const { _id, starttime, endtime, date, examtakers, schoolyearDetails, examtakerDetails} = temp
        
        const examdetails = []

        examtakerDetails.forEach(data => {
            examdetails.push({
                id: data._id
            })
        })
        finaldata.data.push({
            id: _id,
            starttime: starttime,
            endtime: endtime,
            date: date,
            schoolyear: {
                startyear: schoolyearDetails[0].startyear,
                endyear: schoolyearDetails[0].endyear
            },
            examtakers: examdetails
        })
    
    })

    return res.status(200).json({ message: "success", data: finaldata})

}

exports.selectExamSchedules = async (req, res) => {
    const { id } = req.user
    const { examid } = req.query

    if(!id){
        return res.status(400).json({ message: "failed", data: "You are unauthorized! Please login to the right account! "})
    }    
    if(!examid){
        return res.status(400).json({ message: "failed", data: "Please select Exam Schedule."})
    }

    const existingExam = await Examschedule.findOne({
        "examtakers.ticketuser": new mongoose.Types.ObjectId(id),
    });

    if (existingExam) {
        return res
            .status(400)
            .json({ message: "failed", data: "You have already selected an exam schedule." });
    }
    
    await Examschedule.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(examid) },
        { $push: { examtakers: { ticketuser: new mongoose.Types.ObjectId(id) } } }, // Push the user ID to examtakers
    )

    return res.status(200).json({ message: "success" });
    
}