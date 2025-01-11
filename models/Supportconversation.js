const mongoose = require('mongoose');

const SupportConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                userType: {
                    type: String,
                    enum: ['Studentusers', 'Staffusers', 'Ticketusers', 'Anonymous'],
                    required: true,
                },
                anonymousName: {
                    type: String,
                    required: function () {
                        return this.userType === 'Anonymous';
                    },
                },
            },
        ],
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
        },
    },
    { timestamps: true }
);

const SupportConversation = mongoose.model('SupportConversation', SupportConversationSchema);

module.exports = SupportConversation;
