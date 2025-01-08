const { default: mongoose } = require("mongoose")
const Subjectgrade = require("../models/Subjectgrade")
const Schedule = require("../models/Schedule")
const Studentuserdetails = require("../models/Studentuserdetails")
const Schoolyear = require("../models/Schoolyear")
const Staffusers = require("../models/Staffusers")


exports.createsubjectgrade = async (req, res) => {
    const { id } = req.user; // Teacher or admin ID
    const { grades } = req.body; // Array of grades

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({ message: "failed", data: "Grades data must be a non-empty array." });
    }

    const findCurrentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
        .then((data) => data)
        .catch((err) => {
            console.log(`Error fetching current school year: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });

    if (!findCurrentSchoolYear) {
        return res.status(400).json({ message: "failed", data: "Current school year not found." });
    }

    const subjectGrades = [];
    for (const gradeEntry of grades) {
        const { subject, student, quarter, grade, remarks } = gradeEntry;

        if (!subject || !student || !quarter || !grade || !remarks) {
            return res.status(400).json({ 
                message: "failed", 
                data: "Each grade entry must include subject, student, quarter, grade, and remarks." 
            });
        }

        const checkIsGraded = await Subjectgrade.findOne({
            subject: new mongoose.Types.ObjectId(subject),
            student: new mongoose.Types.ObjectId(student),
            quarter: { $regex: `^${quarter}$`, $options: "i" }
        });
        
        if (checkIsGraded) {
            return res.status(400).json({ message: "failed", data: "Duplicate quarter grade not allowed" });
        }
        // Fetch student section
        const getstudentsection = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(student) })
            .catch((err) => {
                console.log(`Error fetching student section: ${err}`);
                return null;
            });

        if (!getstudentsection) {
            return res.status(400).json({ 
                message: "failed", 
                data: `Student section not found for student ID: ${student}` 
            });
        }

        // Check subject by schedule
        const checksubjectbyschedule = await Schedule.findOne({
            teacher: new mongoose.Types.ObjectId(id),
            subject: new mongoose.Types.ObjectId(subject),
            section: new mongoose.Types.ObjectId(getstudentsection.section),
        }).catch((err) => {
            console.log(`Error checking subject schedule: ${err}`);
            return null;
        });

        const getsuperadmin = await Staffusers.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (!checksubjectbyschedule && getsuperadmin.auth !== "superadmin") {
            return res.status(403).json({
                message: "failed",
                data: `Teacher is not authorized to grade student ID: ${student} for subject ID: ${subject}.`,
            });
        }

        // Add valid grade entry to the bulk data
        subjectGrades.push({
            subject: new mongoose.Types.ObjectId(subject),
            student: new mongoose.Types.ObjectId(student),
            schoolyear: findCurrentSchoolYear._id,
            quarter: quarter,
            grade: grade,
            remarks: remarks,
        });
    }

    // Bulk insert grades
    await Subjectgrade.insertMany(subjectGrades)
        .then((data) => {
            return res.status(200).json({ message: "success", data });
        })
        .catch((err) => {
            console.log(`Error creating subject grades: ${err}`);
            return res.status(400).json({ 
                message: "bad-request", 
                data: "There's a problem with the server. Please contact support for more details." 
            });
        });
};


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

exports.deletesubjectgrade = async (req, res) => {

    const { id } = req.user

    const { subjectgrade } = req.body
    
    if(!subjectgrade) {
        return res.status(400).json({
            message: "failed", data: "Subject grade ID is required"
        })
    }


    await Subjectgrade.findOneAndDelete({ _id: new mongoose.Types.ObjectId(subjectgrade) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}


exports.deletesubjectgrade = async (req, res) => {
    const { id } = req.user

    const { sgid } = req.query

    if(!sgid){
        return res.status(400).json({ message: "failed", data: "Please select a subject grade to delete."})
    }

    await Subjectgrade.findOneAndDelete({ _id: new mongoose.Types.ObjectId(sgid)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
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