const { default: mongoose } = require("mongoose");


const SupportMessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supportconversation', // Links to the Conversation model
        required: true,
    },
    type: {
        type: String,
        enum: ['Message', 'System'],
        required: true,
    },
    sender: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        userType: {
            type: String,
            enum: ['Studentusers', 'Staffusers', 'Ticketusers', 'Anonymous', 'System'],
            required: true,
        },
        anonymousName: {
            type: String,
            required: function () {
                return this.userType === 'Anonymous';
            },
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
