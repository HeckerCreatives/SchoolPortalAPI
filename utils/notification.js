
const Notification = require("../models/Notification")

exports.sendmailtostudents = async(senderId, senderType, receivers, title, content) => {

    const notification = new Notification({
        sender: {
            userId: senderId,
            userType: senderType,
        },
        receiver: receivers.map((receiverId) => ({
            userId: receiverId,
            userType: "Studentusers",
        })),
        title,
        content,
    });

    await notification.save();
    return "success"
}