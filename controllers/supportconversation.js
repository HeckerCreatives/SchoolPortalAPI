const { default: mongoose } = require("mongoose");
const Staffusers = require("../models/Staffusers")
const SupportConversation = require("../models/Supportconversation")


exports.createconversation = async (req, res) => {
    const { userid, participant } = req.body;

    if (!participant) {
        return res.status(400).json({ message: "failed", data: "No participant data." });
    }

    const staff = await Staffusers.find({ auth: "support" })
        .then((data) => data)
        .catch((err) => {
            console.log(
                `There's a problem encountered while fetching support staff users in create conversation. Error: ${err}`
            );
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server! Please contact support for more details.",
            });
        });

    if (!staff || staff.length === 0) {
        return res.status(400).json({ message: "failed", data: "No support staff found." });
    }

    // Randomly select a staff user
    const randomStaff = staff[Math.floor(Math.random() * staff.length)];

    const length = await SupportConversation.countDocuments()
    const participants = [
        {
            userid: randomStaff._id,
            userType: "Staffusers",
        },
        {
            userid: userid || null,
            userType: participant,
            anonymousName: participant === "Anonymous" ? `Anonymous${length}` : null,
        },
    ];


    await SupportConversation.create({
        participants,
        status: "open",
    })
        .then((data) => {
            res.status(200).json({ message: "success", data });
        })
        .catch((err) => {
            console.log(`There's a problem encountered while creating conversation. Error: ${err}`);
            res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });
};



exports.Staffgetconversation = async (req, res) => {

    const { id } = req.user;

        const rooms = await SupportConversation.aggregate([
            {
                $match: {
                    "participants.userId": new mongoose.Types.ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: "supportmessages",
                    localField: "_id",
                    foreignField: "conversation",
                    as: "messages", 
                },
            },
            {
                $unwind: {
                    path: "$messages",
                    preserveNullAndEmptyArrays: true, 
                },
            },
            {
                $sort: {
                    "messages.createdAt": -1, 
                },
            },
            {
                $group: {
                    _id: "$_id",
                    participants: { $first: "$participants" },
                    latestMessage: { $first: "$messages" }, 
                },
            },
            {
                $project: {
                    participants: 1,
                    latestMessage: 1,
                },
            },
        ])
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem encountered while fetching aggregated staff converstation. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
        })

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ message: "No conversations found." });
        }

        return res.status(200).json({ message: "success", data: rooms });
}



exports.getmessages = async (req, res) => {
    const { conversationid } = req.query;

        if (!conversationid) {
            return res.status(400).json({ message: "failed", data: "Conversation ID is required." });
        }

        const messages = await SupportConversation.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(conversationid),
                },
            },
            {
                $lookup: {
                    from: 'supportmessages',
                    localField: "_id",
                    foreignField: "conversation",
                    as: "messages",
                },
            },
            {
                $unwind: {
                    path: "$messages",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    "messages.createdAt": 1,
                },
            },
            {
                $project: {
                    "messages._id": 1,
                    "messages.content": 1,
                    "messages.createdAt": 1,
                },
            },
        ])
        .then(data => data)
        .catch(err => {
            console.log(`Error encountered while fetching messages. Error: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        })

        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: "No messages found for this conversation." });
        }

        return res.status(200).json({ message: "success", data: messages });
};
 