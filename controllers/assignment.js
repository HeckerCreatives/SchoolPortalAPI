const { default: mongoose } = require("mongoose")
const Schedule = require("../models/Schedule")
const Schoolyear = require("../models/Schoolyear")
const Assignment = require("../models/Assignment")
const Quest = require("../models/Quest")
const { sendmailtostudents } = require("../utils/notification")
const Section = require("../models/Section")

// #region TEACHER/STUDENT

exports.getassignments = async (req, res) => {
    const { id } = req.user
    const { subject, section } = req.query

    if(!subject || !section){
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    if (!mongoose.Types.ObjectId.isValid(subject)|| !mongoose.Types.ObjectId.isValid(section)) {
        return res.status(400).json({ message: "failed", data: "Invalid Assignment and Section ID format." });
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
                maxscore: 1,
                description: 1,
                duedate: 1,
                submissions: 1,
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
    const { id: teacher, firstname, lastname } = req.user

    const { subject, section, title, description, duedate, maxscore, ison, qtitle, qdescription, qpoints } = req.body

    if(!subject || !section || !title || !description || !duedate || !maxscore){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }
    if (!mongoose.Types.ObjectId.isValid(subject) || !mongoose.Types.ObjectId.isValid(section) || !mongoose.Types.ObjectId.isValid(teacher)) {
        return res.status(400).json({ message: "failed", data: "Invalid Subject, Section or Teacher ID format." });
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

    const { students } = await Section.findOne({ _id: new mongoose.Types.ObjectId(section) })
    
    
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

        const emailContent = `A new assignment has been created by teacher ${firstname} ${lastname} for ${title}. Please check the classroom for more details.`;

        const senderId = new mongoose.Types.ObjectId(teacher); 
        const senderType = "Staffusers"; 
        const receivers = students.map((student) => student._id); 
        
        await sendmailtostudents(senderId, senderType, receivers, "Assignment Notification", emailContent)
            .catch((err) => {
                console.error(`Failed to send notification. Error: ${err}`);
            });

        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while creating assignment. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

exports.deleteassignment = async (req, res) => {
    const { id: teacher, firstname, lastname } = req.user
    const { assignmentid } = req.query

    if(!assignmentid){
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentid)) {
        return res.status(400).json({ message: "failed", data: "Invalid Assignment ID format." });
    }

    const assignment = await Assignment.findOne({
        _id: new mongoose.Types.ObjectId(assignmentid),
        teacher: new mongoose.Types.ObjectId(teacher),
    });

    if (!assignment) {
        return res.status(400).json({ 
            message: "failed", 
            data: "Assignment not found."
        });
    }

    if (assignment.submissions.length > 0) {
        return res.status(400).json({
            message: "failed",
            data: "You cannot delete an assignment that has submissions.",
        });
    }

    const { students } = await Section.findOne({ _id: new mongoose.Types.ObjectId(assignment.section) })


    await Assignment.deleteOne({ _id: new mongoose.Types.ObjectId(assignmentid) })
    .then(async data => {

        await Quest.deleteOne({ assignment: new mongoose.Types.ObjectId(assignmentid) })
        .catch(err => {
            console.log(`There's a problem encountered while deleting quest in delete assignment. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
        })

        const emailContent = `Your assignment titled "${assignment.title}" has been deleted by teacher ${firstname} ${lastname}.`;
      
        const senderId = new mongoose.Types.ObjectId(teacher); 
        const senderType = "Staffusers"; 
        const receivers = students.map((student) => student._id); 
        
        await sendmailtostudents(senderId, senderType, receivers, "Assignment Notification", emailContent)
            .catch((err) => {
                console.error(`Failed to send notification. Error: ${err}`);
            });

        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while deleting assignment. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

exports.editassigment = async (req, res) => {
    const { id: teacher, firstname, lastname} = req.user
    const { assignmentid, title, description, duedate, maxscore } = req.body

    if(!title || !description || !duedate || !maxscore){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentid)) {
        return res.status(400).json({ message: "failed", data: "Invalid Assigment ID format." });
    }

    const assignment = await Assignment.findOne({ _id: new mongoose.Types.ObjectId(assignmentid) })
    .catch(err => {
        console.log(`There's a problem encountered while fetching assignment in edit assignment. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    if (!assignment){
        return res.status(400).json({ message: "failed", data: "Assigment not found."})
    }
    if(assignment.submissions.length > 0){
        return res.status(400).json({ message: "failed", data: "You cannot edit an assignment that has submissions."})
    }

    const date = new Date(duedate)

    await Assignment.updateOne(
        { _id: new mongoose.Types.ObjectId(assignmentid) },
        { $set: { title, description, duedate: date, maxscore } }
    )
    .then(async data => {
        const { students } = await Section.findOne({ _id: new mongoose.Types.ObjectId(assignment.section) })

        const emailContent = `Your assignment titled "${assignment.title}" has been edited by teacher ${firstname} ${lastname}. Please check the classroom for more details.`;

        const senderId = new mongoose.Types.ObjectId(teacher); 
        const senderType = "Staffusers"; 
        const receivers = students.map((student) => student._id); 
        
        await sendmailtostudents(senderId, senderType, receivers, "Assignment Notification", emailContent)
            .catch((err) => {
                console.error(`Failed to send notification. Error: ${err}`);
            });

        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while editing assignment. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

exports.viewsubmissions = async (req, res) => {
    const { id: teacher } = req.user
    const { assignmentid } = req.query
    
    if(!assignmentid){
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentid)) {
        return res.status(400).json({ message: "failed", data: "Invalid Assignment ID format." });
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
            $lookup: {
                from: "quests",
                localField: "_id",
                foreignField: "assignment",
                as: "questdetails"
            }
        },
        {
            $unwind: "$questdetails"
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
                        _id: "$submissions._id",
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
                quest: {
                    $push: {
                        _id: "$questdetails._id",
                        title: "$questdetails.title",
                        descrtiption: "$questdetails.description",
                        points: "$questdetails.points",
                        duedate: "$questdetails.duedate",
                        status: "$questdetails.status"
                    }
                }
            },
        },
        {
            $project: {
                _id: 1,
                assignmentDetails: 1,
                submissions: 1,
                quest: 1,
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

exports.addscore = async (req, res) => {

    const { id: teacher, firstname, lastname } = req.user
    const { assignmentid, studentid, score } = req.body


    if(!assignmentid || !studentid || !score){ 
        return res.status(400).json({ message: "failed", data: "Incomplete Input Fields."})
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentid)|| !mongoose.Types.ObjectId.isValid(studentid)) {
        return res.status(400).json({ message: "failed", data: "Invalid Assignment and Student ID format." });
    }

    const assignment = await Assignment.findOne({
        _id: new mongoose.Types.ObjectId(assignmentid),
        teacher: new mongoose.Types.ObjectId(teacher),
        "submissions.student": new mongoose.Types.ObjectId(studentid)
    });

    if (!assignment) {
        return res.status(400).json({ 
            message: "failed", 
            data: "Assignment not found."
        });
    }

    if(score < 0 || score > assignment.maxscore){
        return res.status(400).json({ message: "failed", data: "Score must be between 0 and max score."})
    }

    await Assignment.updateOne(
        { _id: new mongoose.Types.ObjectId(assignmentid) },
        { $set: { "submissions.$[elem].score": score } },
        { arrayFilters: [{ "elem.student": new mongoose.Types.ObjectId(studentid) }] 
    })
    .then(async data => {
        const emailContent = `Your assignment titled "${assignment.title}" has been graded by teacher ${firstname} ${lastname}. Please check the classroom for more details.`;

        const senderId = new mongoose.Types.ObjectId(teacher); 
        const senderType = "Staffusers"; 
        const receiver = [studentid] 
        
        await sendmailtostudents(senderId, senderType, receiver, "Assignment Notification", emailContent)
            .catch((err) => {
                console.error(`Failed to send notification. Error: ${err}`);
            });


        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while adding score. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

// #endregion

// #region STUDENT

exports.submitassignment = async (req, res) => {
    const { id: student } = req.user
    const { answer, assignmentid } = req.body
    const file = req.file?.path || null;

    let status = "submitted"
    const date = new Date()


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

    if(assignment.duedate < date){
        status = "late"
    }

    const submission = {
        student: new mongoose.Types.ObjectId(student),
        file,
        answer,
        status
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
        "submissions.student": new mongoose.Types.ObjectId(student),
    });

    const submission = assignment.submissions.find(
        (sub) => sub.student.toString() === student
    );

    if (!submission) {
        return res.status(400).json({
            message: "failed",
            data: "Submission not found.",
        });
    }

    if (submission.score !== undefined && submission.score !== null) {
        return res.status(400).json({
            message: "failed",
            data: "You cannot delete a submission that has already been graded.",
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