

const { default: mongoose } = require("mongoose");
const Schedule = require("../models/Schedule");
const Schoolyear = require("../models/Schoolyear");

exports.createSchedule = async (req, res) => {
    const { teacher, subject, section, day, starttime, endtime } = req.body

    if(!teacher || !subject || !section || !day || !starttime || !endtime){
        return res.status(400).json({ message: "failed", data: "Incomplete form data."})
    }

    const existingsubject = await Schedule.findOne({ section: section, subject: subject, day: day });

    if (existingsubject) {
        return res.status(400).json({
            message: "failed",
            data: "Duplicate schedule error: This subject is already scheduled for this section on the same day."
        });
    }

    const conflictingSchedule = await Schedule.findOne({
        teacher: teacher,
        day: day,
        $or: [
            { starttime: { $gte: starttime, $lt: endtime } }, 
            { endtime: { $gt: starttime, $lte: endtime } },  
            {
                $and: [
                    { starttime: { $lte: starttime } },        
                    { endtime: { $gte: endtime } },           
                ],
            },
        ],
    });

    if (conflictingSchedule) {
        return res.status(400).json({
            message: "failed",
            data: "Duplicate schedule error: The teacher is already scheduled at the same time on the same day.",
        });
    }

    const existingSchedule = await Schedule.findOne({
        section,
        day,
        $or: [
            { starttime: starttime },
            { endtime: endtime },
            {
                $and: [
                    { starttime: { $lte: starttime } },
                    { endtime: { $gte: endtime } },
                ],
            },
        ],
    });
    
    if (existingSchedule) {
        return res.status(400).json({
            message: "failed",
            data: `Duplicate schedule error: A conflicting schedule for ${section} already exists.`
        });
    }

    const currentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for current school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    if (!currentSchoolYear) {
        return res.status(400).json({
            message: "failed",
            data: "No current school year found. Please set a current school year."
        });
    }

    await Schedule.create({
        teacher: new mongoose.Types.ObjectId(teacher),
        subject: new mongoose.Types.ObjectId(subject),
        section: new mongoose.Types.ObjectId(section),
        schoolyear: currentSchoolYear._id,
        day: day,
        starttime: starttime,
        endtime: endtime
    })
    .then(data => data)
    .catch(err => { 
        console.log(`There's a problem encountered while creating schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getSchedules = async (req, res) => {
    const { teacherId } = req.query;

    if (!teacherId) {
        return res.status(400).json({ message: "Teacher ID is required." });
    }

    const matchconditionpipeline = [
        {
            $match: {
                teacher: new mongoose.Types.ObjectId(teacherId),
            },
        },
        {
            $lookup: {
                from: "staffusers",
                localField: "teacher",
                foreignField: "_id",
                as: "Teacherdetails",
            },
        },
        {
            $unwind: { path: "$Teacherdetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "Subjectdetails",
            },
        },
        {
            $unwind: { path: "$Subjectdetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "Sectiondetails",
            },
        },
        {
            $unwind: { path: "$Sectiondetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "schoolyears",
                localField: "schoolyear",
                foreignField: "_id",
                as: "Schoolyeardetails",
            },
        },
        {
            $unwind: { path: "$Schoolyeardetails", preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                teacher: "$Teacherdetails.username",
                subject: "$Subjectdetails.name",
                section: "$Sectiondetails.name",
                schoolyear: "$Schoolyeardetails.year",
                day: 1,
                starttime: 1,
                endtime: 1,
            },
        },
    ];

    const schedules = await Schedule.aggregate(matchconditionpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching schedule of teacher: ${teacherId}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })
    const finaldata = []

    schedules.forEach(temp => {
        finaldata.push({
            id: temp._id,
            day: temp.day,
            starttime: temp.starttime,
            endtime: temp.endtime,
            teacher: temp.teacher,
            subject: temp.subject,
            section: temp.section
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}