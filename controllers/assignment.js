const { default: mongoose } = require("mongoose")
const Schedule = require("../models/Schedule")
const Schoolyear = require("../models/Schoolyear")
const Assignment = require("../models/Assignment")
const Quest = require("../models/Quest")

// #region TEACHER/STUDENT

exports.getassignments = async (req, res) => {
    const { id } = req.user
    const { subject, section } = req.query

    if(!subject || !section){
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    const data = await Assignment.aggregate([
        {
            $match: {
                subject: new mongoose.Types.ObjectId(subject),
                section: new mongoose.Types.ObjectId(section),
            },
        },
        {
            $lookup: {
                from: "quests",
                localField: "_id",
                foreignField: "assignment", 
                as: "questdetails",
            },
        },
        {
            $project: {
                _id: 1,
                title: 1, 
                description: 1,
                duedate: 1,
                questdetails: 1, 
            },
        },
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching assignments. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    
    return res.status(200).json({ message: "success", data: data })

}

// #endregion

// #region TEACHER/ADVISER

exports.createassignment = async (req, res) => {
    const { id: teacher } = req.user

    const { subject, section, title, description, duedate, maxscore, ison, qtitle, qdescription, qpoints } = req.body

    if(!subject || !section || !title || !description || !duedate || !maxscore){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }

    const checkuser = await Schedule.findOne({
        subject: new mongoose.Types.ObjectId(subject),
        section: new mongoose.Types.ObjectId(section),
        teacher: new mongoose.Types.ObjectId(teacher)
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking teacher, subject, section in create assignement. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    if(!checkuser){
        return res.status(400).json({ message: "failed", data: "Unauthorized! User is not authorized to create assignment for this section."})
    }

    const schoolyear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching current school year in create assignement. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
    const date = new Date(duedate)

    await Assignment.create({
        subject,
        section,
        teacher,
        title,
        description,
        duedate: date,
        maxscore,
        schoolyear: schoolyear._id,
    })
    .then(async data => {

        if(ison === "true"){
            if(!qtitle || !qdescription || !qpoints){
                await Assignment.findOne({ _id: data._id })
                .catch(err => {
                    console.log(`There's a problem encountered while deleting assignment in failed create assignment. Error: ${err}`)
                    return res.status(400).json({ message: "bad-request1", data: "There's a problem with the server! Please contact support for more details."})
                })
                return res.status(400).json({ message: "failed", data: "Incomplete quest data."})
            }

            await Quest.create({
                assignment: data._id,
                subject,
                section,
                teacher,
                title: qtitle,
                description: qdescription,
                points: qpoints,
                duedate: duedate,
                schoolyear: schoolyear._id
            })
            .catch(err => {
                console.log(`There's a problem encountered while creating quest in create assignment. Error: ${err}`)
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
            })   
        }
        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while creating assignment. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

exports.viewsubmissions = async (req, res) => {
    const { id: teacher } = req.user
    const { assignmentid } = req.query
    
    if(!assignmentid){
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    const data = await Assignment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(assignmentid),
                teacher: new mongoose.Types.ObjectId(teacher),
            },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "submissions.student",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        {
            $unwind: "$submissions", // Break down each submission into separate documents
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "submissions.student",
                foreignField: "owner",
                as: "submissions.studentDetails", // Add student details directly into the submissions array
            },
        },
        {
            $unwind: "$submissions.studentDetails", // Ensure each student has their details expanded
        },
        {
            $group: {
                _id: "$_id", // Group back to the assignment level
                assignmentDetails: {
                    $first: {
                        teacher: "$teacher",
                        subject: "$subject",
                        section: "$section",
                        schoolyear: "$schoolyear",
                        title: "$title",
                        description: "$description",
                        duedate: "$duedate",
                        maxscore: "$maxscore",
                    },
                },
                submissions: {
                    $push: {
                        student: "$submissions.student",
                        file: "$submissions.file",
                        answer: "$submissions.answer",
                        score: "$submissions.score",
                        studentDetails: {
                            firstName: "$submissions.studentDetails.firstname",
                            lastName: "$submissions.studentDetails.lastname",
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                assignmentDetails: 1,
                submissions: 1,
            },
        },
    ])    
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching submissions. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    return res.status(200).json({ message: "success", data: data })
}

// #endregion

// #region STUDENT

exports.submitassignment = async (req, res) => {
    const { id: student } = req.user
    const { answer, assignmentid } = req.body
    const file = req.file?.path || null;


    if(!file && !answer){
        return res.status(400).json({ message: "failed", data: "Student must at least submit a file or an answer."})
    }
    const assignment = await Assignment.findOne({
        _id: new mongoose.Types.ObjectId(assignmentid),
        "submissions.student": new mongoose.Types.ObjectId(student)
    });

    if (assignment) {
        return res.status(400).json({ 
            message: "failed", 
            data: "You have already submitted in this assignment."
        });
    }

    const submission = {
        student: new mongoose.Types.ObjectId(student),
        file,
        answer,
    };

    await Assignment.updateOne(
        { _id: new mongoose.Types.ObjectId(assignmentid) },
        { $push: { submissions: submission } }
    )
    .then(data => {
        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while creating assignment. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

}

exports.deletesubmission = async (req, res) => {
    const { id: student } = req.user
    const { assignmentid } = req.query

    if(!assignmentid){
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    const assignment = await Assignment.findOne({
        _id: new mongoose.Types.ObjectId(assignmentid),
        "submissions.student": new mongoose.Types.ObjectId(student)
    });

    if (!assignment) {
        return res.status(400).json({ 
            message: "failed", 
            data: "You have not submitted this assignment."
        });
    }

    await Assignment.updateOne(
        { _id: new mongoose.Types.ObjectId(assignmentid) },
        { $pull: { submissions: { student: new mongoose.Types.ObjectId(student) } } }
    )
    .then(data => {
        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while deleting submission. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

// #endregion