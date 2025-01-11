const { default: mongoose } = require("mongoose")
const SupportMessage = require("../models/Supportmessage")


exports.anonymoussendmessage = async (req, res) => {

    const { conversationid, message } = req.user

    if (!conversationid) {
        return res.status(400).json({ message: "failed", data: "Conversation ID is required." });
    }

    if (!message) {
        return res.status(400).json({ message: "failed", data: "Message data is required." });
    }

    await SupportMessage.create({
        conversation: new mongoose.Types.ObjectId(conversationid),
        message: message,
        sender: {
            userType: "Anonymous" 
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while anonymous user sending message. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.staffsendmessage = async (req, res) => {

    const { id } = req.user
    const { conversationid, message } = req.user

    if (!conversationid) {
        return res.status(400).json({ message: "failed", data: "Conversation ID is required." });
    }

    if (!message) {
        return res.status(400).json({ message: "failed", data: "Message data is required." });
    }

    await SupportMessage.create({
        conversation: new mongoose.Types.ObjectId(conversationid),
        message: message,
        sender: {
            userId: new mongoose.Types.ObjectId(id),
            userType: "Staffusers" 
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while anonymous user sending message. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}