const { default: mongoose } = require("mongoose")
const Notification = require("../models/Notification")

exports.getnotifications = async (req, res) => {
    const { id } = req.user

    await Notification.find({ receiver: new mongoose.Types.ObjectId(id) })
    .populate("sender")
    .populate("receiver")
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