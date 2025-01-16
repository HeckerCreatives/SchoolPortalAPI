const { default: mongoose } = require("mongoose");
const Staffusers = require("../models/Staffusers")
const SupportConversation = require("../models/Supportconversation");
const SupportMessage = require("../models/Supportmessage");


exports.createconversation = async (req, res) => {
    const { userid, participant } = req.body;

    if (!participant) {
        return res.status(400).json({ message: "failed", data: "No participant data." });
    }


    const anonymousCount = await SupportConversation.aggregate([
        { $unwind: "$participants" },
        { $match: { "participants.userType": "Anonymous" } }, 
        { $count: "count" },
    ]);

    const length = anonymousCount.length > 0 ? anonymousCount[0].count : 0;    
    const participants = [
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

exports.createticketuserconversation = async (req, res) => {
    const { id } = req.user;

    if (!id) {
        return res.status(400).json({ message: "failed", data: "No participant data." });
    }

    const participants = [
        {
            userId: id,
            userType: 'Ticketusers',
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
exports.createstudentuserconversation = async (req, res) => {
    const { id } = req.user;

    if (!id) {
        return res.status(400).json({ message: "failed", data: "No participant data." });
    }

    const participants = [
        {
            userId: id,
            userType: 'Studentusers',
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



exports.studentgetconversation = async (req, res) => {
    const { id } = req.user;

   await SupportConversation.aggregate([
        {
            $match: {
                participants: { $elemMatch: { userId: new mongoose.Types.ObjectId(id) } },
            },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "participants.userId",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "participants.userId",
                foreignField: "owner",
                as: "staffdetails",
            },
        },
        {
            $addFields: {
                participants: {
                    $map: {
                        input: "$participants",
                        as: "participant",
                        in: {
                            $mergeObjects: [
                                "$$participant",
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: { $concatArrays: ["$studentdetails", "$staffdetails"] },
                                                as: "details",
                                                cond: { $eq: ["$$details.owner", "$$participant.userId"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
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
            $addFields: {
                isOwnerless: {
                    $not: {
                        $in: ["Staffusers", "$participants.userType"],
                    },
                },
            },
        },
        {
            $project: {
                participants: {
                    userId: 1,
                    userType: 1,
                    anonymousName: 1,
                    firstname: 1,
                    middlename: 1,
                    lastname: 1,
                },
                latestMessage: 1,
                isOwnerless: 1,
            },
        },
    ])
        .then((data) => {
            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No conversations found." });
            }
            return res.status(200).json({ message: "success", data });
        })
        .catch((err) => {
            console.log(`Error fetching conversations: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });
    
};

exports.ticketgetconversation = async (req, res) => {
    const { id } = req.user;

   await SupportConversation.aggregate([
        {
            $match: {
                participants: { $elemMatch: { userId: new mongoose.Types.ObjectId(id) } },
            },
        },
        {
            $lookup: {
                from: "requirements",
                localField: "participants.userId",
                foreignField: "owner",
                as: "ticketdetails",
            },
        },
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "participants.userId",
                foreignField: "owner",
                as: "staffdetails",
            },
        },
        {
            $addFields: {
                participants: {
                    $map: {
                        input: "$participants",
                        as: "participant",
                        in: {
                            $mergeObjects: [
                                "$$participant",
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: { $concatArrays: ["$ticketdetails", "$staffdetails"] },
                                                as: "details",
                                                cond: { $eq: ["$$details.owner", "$$participant.userId"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
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
            $addFields: {
                isOwnerless: {
                    $not: {
                        $in: ["Staffusers", "$participants.userType"],
                    },
                },
            },
        },
        {
            $project: {
                participants: {
                    userId: 1,
                    userType: 1,
                    anonymousName: 1,
                    firstname: 1,
                    middlename: 1,
                    lastname: 1,
                },
                latestMessage: 1,
                isOwnerless: 1,
            },
        },
    ])
        .then((data) => {
            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No conversations found." });
            }
            return res.status(200).json({ message: "success", data });
        })
        .catch((err) => {
            console.log(`Error fetching conversations: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });
    
};


exports.Staffgetconversation = async (req, res) => {
    const { id } = req.user;

    await SupportConversation.aggregate([
        {
            $match: {
                $or: [
                    { participants: { $elemMatch: { userId: new mongoose.Types.ObjectId(id) } } },
                    { "participants.userType": { $ne: "Staffusers" } },
                ],
            },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "participants.userId",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        {
            $lookup: {
                from: "ticketuserdetails",
                localField: "participants.userId",
                foreignField: "owner",
                as: "ticketdetails",
            },
        },
        {
            $addFields: {
                participants: {
                    $map: {
                        input: "$participants",
                        as: "participant",
                        in: {
                            $mergeObjects: [
                                "$$participant",
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: {
                                                    $concatArrays: [
                                                        "$studentdetails",
                                                        "$ticketdetails",
                                                    ],
                                                },
                                                as: "details",
                                                cond: {
                                                    $eq: ["$$details.owner", "$$participant.userId"],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
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
            $addFields: {
                isOwnerless: {
                    $not: {
                        $in: ["Staffusers", "$participants.userType"],
                    },
                },
            },
        },
        {
            $project: {
                participants: {
                    userId: 1,
                    userType: 1,
                    anonymousName: 1,
                    firstname: 1,
                    middlename: 1,
                    lastname: 1,
                },
                latestMessage: 1,
                isOwnerless: 1,
            },
        },
    ])
        .then((data) => {
            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No conversations found." });
            }
            return res.status(200).json({ message: "success", data });
        })
        .catch((err) => {
            console.log(`Error fetching conversations: ${err}`);
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


exports.matchstaffuserwithconversation = async (req, res) => {
    const { id } = req.user

    const { conversationid } = req.body


    if(!conversationid){
        return res.status(400).json({ message: "failed", data: "There is no conversation ID in your selected conversation."})
    }

    const newparticipant = [
        {
            userId: new mongoose.Types.ObjectId(id),
            userType: "Staffusers"
        }        
    ]

    const updatedConversation = await SupportConversation.updateOne(
        { _id: new mongoose.Types.ObjectId(conversationid) },
        { $push: { participants: newparticipant } }
    )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating conversation. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    if (updatedConversation.nModified === 0) {
        return res.status(404).json({ message: "failed", data: "Conversation not found or no change made." });
    }

    await SupportMessage.create({
        conversation: new mongoose.Types.ObjectId(conversationid),
        message: 'Chat support user has connected. Please wait, and the agent will assist you shortly.',
        type: "System",
        sender: {
          userType: "System", 
        },
      })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while System user sending message. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" });

}

exports.disconnectstaffuserwithconversation = async (req, res) => {
    const { userid, conversationid } = req.query

    if (!userid || !conversationid) {
        return res.status(400).json({ message: "failed", data: "User ID and conversation ID are required." });
    }

    const updatedConversation = await SupportConversation.updateOne(
        { 
            _id: new mongoose.Types.ObjectId(conversationid),
            "participants.userId": new mongoose.Types.ObjectId(userid),
            "participants.userType": "Staffusers"
        },
        { $pull: { participants: { userId: new mongoose.Types.ObjectId(userid) } } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while disconnecting Staff user in the conversation. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    if (updatedConversation.nModified === 0) {
        return res.status(404).json({ message: "failed", data: "Staff user not found in conversation or already disconnected." });
    }

    if (!conversationid) {
        return res.status(400).json({ message: "failed", data: "Conversation ID is required." });
    }

    await SupportMessage.create({
        conversation: new mongoose.Types.ObjectId(conversationid),
        message: 'Chat support user has disconnected. Please wait, and a new support agent will assist you shortly.',
        type: "Disconnect",
        sender: {
          userType: "System", 
        },
      })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while System user sending message. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" });

}