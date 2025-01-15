const { default: mongoose } = require("mongoose");
const Staffusers = require("../models/Staffusers")
const SupportConversation = require("../models/Supportconversation")


exports.createconversation = async (req, res) => {
    const { userid, participant } = req.body;

    if (!participant) {
        return res.status(400).json({ message: "failed", data: "No participant data." });
    }

    const staff = await Staffusers.find({ auth: "superadmin" })
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
            userId: randomStaff._id,
            userType: "Staffusers",
        },
        {
            userId: userid || null,
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

    SupportConversation.aggregate([
        {
            $match: {
                "participants": {
                    $elemMatch: { userId: new mongoose.Types.ObjectId(id) }
                },
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
            $sort: {
                "latestMessage.createdAt": -1, 
            },
        },
        {
            $project: {
                participants: 1,
                latestMessage: 1,
            },
        },
    ])
    .then(data => {
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No conversations found." });
        }
        return res.status(200).json({ message: "success", data });
    })
    .catch(err => {
        console.log(`There's a problem encountered while fetching aggregated staff conversation. Error: ${err}`);
        return res.status(400).json({
            message: "bad-request",
            data: "There's a problem with the server. Please contact support for more details.",
        });
    });
};


exports.getmessages = async (req, res) => {
    const { conversationid } = req.query;

    if (!conversationid) {
        return res.status(400).json({ message: "failed", data: "Conversation ID is required." });
    }

    await SupportConversation.aggregate([
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
            $group: {
                _id: "$_id",  // Group by conversation
                messages: { $push: "$messages" },
                participants: { $first: "$participants" },
            },
        }
    ])
    .then(messages => {
        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: "No messages found for this conversation." });
        }

        const finalData = {
            participants: messages[0].participants,
            messages: []
        };

        messages[0].messages.forEach(message => {
           finalData.messages.push(message)
        });

        return res.status(200).json({ message: "success", data: finalData });
    })
    .catch(err => {
        console.log(`Error encountered while fetching messages. Error: ${err}`);
        return res.status(400).json({
            message: "bad-request",
            data: "There's a problem with the server. Please contact support for more details.",
        });
    });
};
