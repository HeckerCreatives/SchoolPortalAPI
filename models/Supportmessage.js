const { default: mongoose } = require("mongoose");


const SupportMessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supportconversation', // Links to the Conversation model
        required: true,
    },
    sender: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        userType: {
            type: String,
            enum: ['Studentusers', 'Staffusers', 'Ticketusers', 'Anonymous'],
            required: true,
        },
    },
    message: { 
        type: String, 
        required: true,
    },
    read: { 
        type: Boolean, 
        default: false,
    },
}, { timestamps: true });

const SupportMessage = mongoose.model('SupportMessage', SupportMessageSchema);
module.exports = SupportMessage;
