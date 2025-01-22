const { default: mongoose } = require("mongoose")
const Quest = require("../models/Quest")
const Schoolyear = require("../models/Schoolyear")
const Wallets = require("../models/Wallet")
const Assignment = require("../models/Assignment")
const Section = require("../models/Section")


exports.createquest = async (req, res) => {
    const { id: teacher } = req.user
    const { section, subject, title, description, points, duedate } = req.body

    if(!section || !subject){
        return res.status(400).json({ message: "bad-request", data: "Section and Subject ID not found."})
    }
    if(!section || !subject || !title || description || points || duedate){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }

    const schoolyear = await Schoolyear.findOne({ currentstatus: "current" })
    .catch(err => {
        console.log(`There's a problem encountered while fetching current school year in create quest. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    await Quest.create({
        section: new mongoose.Types.ObjectId(section),
        subject: new mongoose.Types.ObjectId(subject),
        teacher: new mongoose.Types.ObjectId(teacher),
        schoolyear: schoolyear._id,
        title,
        description,
        points,
        duedate
    })
    .then(data => {
        if(!data){
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
        }
        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while creating quest. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}

exports.updatequest = async (req, res) => {
    const { id: teacher, firstname, lastname } = req.user
    const { questid, title, description, points, duedate } = req.body

    if(!questid || !title || description || points || duedate){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }

    await Quest.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(questid) },
        {
            $set: {
                title,
                description,
                points,
                duedate
            }
        },
        { new: true } 
    )
        .then(async data => {
            if (!data) {
                return res.status(400).json({ message: "bad-request", data: "Quest not found or update failed." });
            }

            const assignment = await Assignment.findOne({ _id: new mongoose.Types.ObjectId(data.assignment)})

            const { students } = await Section.findOne({ _id: new mongoose.Types.ObjectId(assignment.section)})

            const emailContent = `The quest "${data.title}" has been updated. Please check the details below: \n\nTitle: ${data.title}\nDescription: ${data.description}\nPoints: ${data.points}\nDue Date: ${data.duedate}\n\nThis quest was facilitated by teacher ${firstname} ${lastname}.`;
       
            const senderId = new mongoose.Types.ObjectId(teacher); 
            const senderType = "Staffusers"; 
            const receivers = students.map((student) => student._id); 
            
            await sendmailtostudents(senderId, senderType, receivers, "Assignment Notification", emailContent)
                .catch((err) => {
                    console.error(`Failed to send notification. Error: ${err}`);
                });           
            
            return res.status(200).json({ message: "success" });
        })
        .catch(err => {
            console.log(`There's a problem encountered while updating quest. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "Quest not found or update failed." });
        });
}
exports.deletequest = async (req, res) => {
    const { id: teacher, firstname, lastname } = req.user
    const { questid } = req.query;

    if (!questid) {
        return res.status(400).json({ message: "failed", data: "Select a quest to delete." });
    }

    await Quest.findOneAndDelete({ _id: new mongoose.Types.ObjectId(questid) })
        .then(async data => {
            if (!data) {
                return res.status(404).json({ message: "not-found", data: "Quest not found or already deleted." });
            }

            const assignment = await Assignment.findOne({ _id: new mongoose.Types.ObjectId(data.assignment)})

            const { students } = await Section.findOne({ _id: new mongoose.Types.ObjectId(assignment.section)})

            const emailContent = `The quest "${data.title}" has been deleted. This quest was facilitated by teacher ${firstname} ${lastname}.`;
       
            const senderId = new mongoose.Types.ObjectId(teacher); 
            const senderType = "Staffusers"; 
            const receivers = students.map((student) => student._id); 
            
            await sendmailtostudents(senderId, senderType, receivers, "Assignment Notification", emailContent)
                .catch((err) => {
                    console.error(`Failed to send notification. Error: ${err}`);
                });           
            
            
            return res.status(200).json({ message: "success", data: "Quest successfully deleted." });
        })
        .catch(err => {
            console.error(`Error deleting quest: ${err}`);
            return res.status(500).json({ message: "server-error", data: "There's a problem with the server! Please contact support for more details." });
        });
};


exports.getquestbysubjectsection = async (req, res) => {

    const { subject, section, page, limit } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    if(!subject || !section){
        return res.status(400).json({ message: "bad-request", data: "Section and Subject ID not found."})
    }
    if(!mongoose.isValidObjectId(section) || !mongoose.isValidObjectId(subject)){
        return res.status(400).json({ 
            message: "failed", 
            data: "Invalid section ID format." 
        });
    }


    await Quest.find({ subject: new mongoose.Types.ObjectId(subject), section: new mongoose.Types.ObjectId(section)})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({ createdAt: -1 })  
    .then(data => {
        if(data.length <= 0){
            return res.status(400).json({ message: "failed", data: "No quest data found."})
        }
        return res.status(200).json({ message: "success", data: data})
    })
    .catch(err => {
      console.log(`There's a problem while fetching school year. Error: ${err}`);
      return res.status(400).json({
        message: "bad-request",
        data: "There's a problem with the server. Please contact support for more details."
      });
    });

}


exports.sendpoints = async (req, res) => {
    
    const { id, firstname, lastname } = req.user
    const { questid, students, points } = req.body

    if(!questid || !points){
        return res.status(400).json({ message: "failed", data: "Incomplete input data."})
    }

    if(!students || students.length <= 0){
        return res.status(400).json({ message: "failed", data: "No student data found."})
    }

    const quest = await Quest.findOne({ _id: new mongoose.Types.ObjectId(questid) })
    .catch(err => {
        console.log(`There's a problem encountered while fetching quest data in sendpoints. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    if(quest.status === "Completed"){
        return res.status(400).json({ message: "failed", data: "Quest is already completed."})
    }
    await Quest.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(questid) }, { $set: { status: "Completed"} })
    .catch(err => {
        console.log(`There's a problem encountered while completing quest. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    students.map(async (student) => {
        await Wallets.findOneAndUpdate({ owner: new mongoose.Types.ObjectId(student) }, { $inc: { amount: points }})
        .catch(err => {
            console.log(`There's a problem encountered while updating wallet for student user: ${student}. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
        })
    })

    const emailContent = `Congratulations! You have earned ${points} points for completing the quest "${quest.title}". This quest was facilitated by teacher ${firstname} ${lastname}. Please check your wallet for updates.`;
    
    const senderId = new mongoose.Types.ObjectId(id); 
    const senderType = "Staffusers"; 
    const receiver = students
            
    await sendmailtostudents(senderId, senderType, receiver, "Assignment Notification", emailContent)
        .catch((err) => {
            console.error(`Failed to send notification. Error: ${err}`);
        });

    return res.status(200).json({ message: "success" })
}

