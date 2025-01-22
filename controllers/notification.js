const { default: mongoose } = require("mongoose")
const Notification = require("../models/Notification")

exports.getnotifications = async (req, res) => {
    const { id } = req.user

    await Notification.find(
        { "receiver.userId": new mongoose.Types.ObjectId(id) },
        {
            "receiver.$": 1, // Use $elemMatch to return only the matching receiver
            sender: 1,
            title: 1,
            content: 1,
            createdAt: 1,
        }
    )
    .populate("sender.userId", "firstname lastname") // Populate sender with selected fields
    .exec()    
    .then(data => {
        if(!data){
            return res.status(400).json({ message: "failed", data: "No notifications found."})
        }
        return res.status(200).json({ message: "success", data: data })
    })
    .catch(err => {
        console.log(`There's a problem encountered while fetching notifications. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}


exports.readnotification = async (req, res) => {
    const { id } = req.user

    await Notification.updateMany(
        { "receiver.userId": new mongoose.Types.ObjectId(id) },
        { $set: { "receiver.$[elem].isRead": true } },
        { arrayFilters: [{ "elem.userId": new mongoose.Types.ObjectId(id) }] }
    )    
    .then(data => {
        if(!data){
            return res.status(400).json({ message: "failed", data: "No notifications found."})
        }
        return res.status(200).json({ message: "success" })
    })
    .catch(err => {
        console.log(`There's a problem encountered while updating notifications. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}
