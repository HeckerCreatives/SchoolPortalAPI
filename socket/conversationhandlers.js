const mongoose = require("mongoose");
const SupportConversation = require("../models/Supportconversation");
const SupportMessage = require("../models/Supportmessage");
const Staffusers = require("../models/Staffusers");
const { createconversation, getmessages } = require("../controllers/supportconversation");

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('createConversation', createconversation)

        socket.on('getConversations', getmessages);

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};
