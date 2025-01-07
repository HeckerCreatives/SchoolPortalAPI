const { default: mongoose } = require("mongoose")
const Subjectgrade = require("../models/Subjectgrade")
const Schedule = require("../models/Schedule")
const Studentuserdetails = require("../models/Studentuserdetails")
const Schoolyear = require("../models/Schoolyear")


exports.createsubjectgrade = async (req, res) => {
    const { id } = req.user

    const { student, subject, quarter, grademarks, remarks } = req.body

    if(!student || !subject || !quarter || !grademarks) {
        return res.status(400).json({
            message: "failed", data: "All fields are required"
        })
    }

    const getstudentsection = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(student) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching student section. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const checksubjectbyschedule = await Schedule.findOne({
        teacher: new mongoose.Types.ObjectId(id),
        subject: new mongoose.Types.ObjectId(subject),
        section: new mongoose.Types.ObjectId(getstudentsection.section),
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking subject schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    if (!checksubjectbyschedule) {
        return res.status(403).json({
            message: "failed",
            data: "Teacher is not authorized to grade this student for this subject",
        });
    }

    await Subjectgrade.create({
        teacher: new mongoose.Types.ObjectId(id),
        student,
        subject,
        quarter,
        grade: grademarks,
        remarks
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.createsubjectgradenew = async (req, res) => {

    const { subject, student, quarter, grade, remarks } = req.body

    if(!subject || !student || !quarter || !grade || !remarks){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }

    const findCurrentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching currentschool year in create subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    // check the current quarter soon to add

    await Subjectgrade.create({
        subject: new mongoose.Types.ObjectId(subject),
        student: new mongoose.Types.ObjectId(student),
        schoolyear: findCurrentSchoolYear._id,
        quarter: quarter,
        grade: grade,
        remarks: remarks,
    })
    .then(data => data)
    .catch(err => {
        
    })
}

exports.editsubjectgrade = async (req, res) => {

    const { id } = req.user

    const { subjectgrade, remarks, grade } = req.body
    if(!subjectgrade) {
        return res.status(400).json({
            message: "failed", data: "Subject grade ID is required"
        })
    }

    if(!grade){
        return res.status(400).json({
            message: "failed", data: "Grade is required"
        })
    }

    await Subjectgrade.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(subjectgrade) }, { $set: { grade, remarks } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getstudentsubjectgrade = async (req, res) => {
        const { student } = req.query

        if(!student) {
            return res.status(400).json({
                message: "failed", data: "Student ID is required"
            })
        }

        const studentgrades = await Subjectgrade.aggregate([
            {
                $match: { student: new mongoose.Types.ObjectId(student) },
            },
            {
                $lookup: {
                    from: "studentuserdetails",
                    localField: "student",
                    foreignField: "owner",
                    as: "studentdetails",
                },
            },
            {
                $unwind: "$studentdetails",
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subjectdetails",
                },
            },
            {
                $unwind: "$subjectdetails",
            },
        ])
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem encoutered while fetching student grade. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
        })


        const finaldata = []

        studentgrades.forEach(grade => {
            finaldata.push({
                student: {
                    id: grade.studentdetails.owner,
                    name: `${grade.studentdetails.firstname} ${grade.studentdetails.lastname}`,
                    email: grade.studentdetails.email,
                },
                subject: {
                    id: grade.subjectdetails._id,
                    name: grade.subjectdetails.name,
                },
                grades: {
                    quarter: grade.quarter,
                    grade: grade.grade || [],
                    remarks: grade.remarks || "N/A",
                }
            })
        })

    return res.status(200).json({ message: "success", data: finaldata})
}


exports.getsubjectgradestudent = async (req, res) => {
    const { id } = req.user

    const studentgrades = await Subjectgrade.aggregate([
        {
            $match: { student: new mongoose.Types.ObjectId(id) },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "student",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        {
            $unwind: "$studentdetails",
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subjectdetails",
            },
        },
        {
            $unwind: "$subjectdetails",
        },
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encoutered while fetching student grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })


    const finaldata = []

    studentgrades.forEach(grade => {
        finaldata.push({
            student: {
                id: grade.studentdetails.owner,
                name: `${grade.studentdetails.firstname} ${grade.studentdetails.lastname}`,
                email: grade.studentdetails.email,
            },
            subject: {
                id: grade.subjectdetails._id,
                name: grade.subjectdetails.name,
            },
            grades: {
                quarter: grade.quarter,
                grade: grade.grade || [],
                remarks: grade.remarks || "N/A",
            }
        })
    })

return res.status(200).json({ message: "success", data: finaldata})
}



exports.getsubjectgradebystudentid = async (req, res) => {

    const { id } = req.user

    const { studentid } = req.query

    const studentgrades = await Subjectgrade.aggregate([
        {
            $match: { student: new mongoose.Types.ObjectId(studentid) },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "student",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        {
            $unwind: "$studentdetails",
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subjectdetails",
            },
        },
        {
            $unwind: "$subjectdetails",
        },
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encoutered while fetching student grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })


    const finaldata = []

    studentgrades.forEach(grade => {
        finaldata.push({
            student: {
                id: grade.studentdetails.owner,
                name: `${grade.studentdetails.firstname} ${grade.studentdetails.lastname}`,
                email: grade.studentdetails.email,
            },
            subject: {
                id: grade.subjectdetails._id,
                name: grade.subjectdetails.name,
            },
            grades: {
                quarter: grade.quarter,
                grade: grade.grade || [],
                remarks: grade.remarks || "N/A",
            }
        })
    })

}