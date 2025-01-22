const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        sender: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                index: true,
            },
            userType: {
                type: String,
                enum: ["Staffusers", "Studentusers"],
                required: true,
            },
        },
        receiver: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    index: true,
                },
                userType: {
                    type: String,
                    enum: ["Staffusers", "Studentusers"],
                    required: true,
                },
                isRead: {
                    type: Boolean,
                    default: false,
                }
            },
        ],
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        sendToAll: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification
