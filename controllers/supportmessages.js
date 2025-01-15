const { default: mongoose } = require("mongoose")
const SupportMessage = require("../models/Supportmessage");
const SupportConversation = require("../models/Supportconversation");


exports.anonymoussendmessage = async (req, res) => {
    const { userid, participant, message, conversationid } = req.body;

    if (!participant || participant !== "Anonymous") {
        return res.status(400).json({ message: "failed", data: "Participant must be anonymous." });
    }

    if (!message) {
        return res.status(400).json({ message: "failed", data: "Message data is required." });
    }

    try {
        let conversation;

        if (conversationid) {
            // Check if the conversation exists
            conversation = await SupportConversation.findOne({
                _id: new mongoose.Types.ObjectId(conversationid),
                "participants.userType": "Anonymous",
            });

            if (!conversation) {
                return res.status(404).json({ message: "failed", data: "Conversation not found." });
            }
        } else {
            // Fetch support staff users if no conversation ID is provided
            const staff = await Staffusers.find({ auth: "superadmin" });
            if (!staff || staff.length === 0) {
                return res.status(400).json({ message: "failed", data: "No support staff found." });
            }

            // Randomly select a staff user
            const randomStaff = staff[Math.floor(Math.random() * staff.length)];

            // Count documents for unique anonymous name
            const length = await SupportConversation.countDocuments();

            // Create a new conversation
            const participants = [
                {
                    userId: randomStaff._id,
                    userType: "Staffusers",
                },
                {
                    userId: userid || null, 
                    userType: participant,
                    anonymousName: `Anonymous${length}`,
                },
            ];

            conversation = await SupportConversation.create({
                participants,
                status: "open",
            });
        }

        // Create and send the message
        await SupportMessage.create({
            conversation: conversation._id,
            message: message,
            sender: {
                userType: "Anonymous",
                anonymousName: conversation.participants.find(p => p.userType === "Anonymous").anonymousName,
            },
        });

        return res.status(200).json({ message: "success", data: { conversationId: conversation._id } });
    } catch (err) {
        console.error(`Error sending message: ${err}`);
        return res.status(500).json({
            message: "bad-request",
            data: "There's a problem with the server! Please contact support for more details.",
        });
    }
};



exports.staffsendmessage = async (req, res) => {

    const { id } = req.user
    const { conversationid, message } = req.body

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