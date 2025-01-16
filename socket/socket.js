const { default: mongoose } = require("mongoose")
const SupportMessage = require("../models/Supportmessage");
const SupportConversation = require("../models/Supportconversation");

const connectedStaff = {}; 

const sockethandler = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    let roomid = ''
    let username = ''

    socket.on('Staff_connected', (userId) => {
      if (!userId) {
        return socket.emit('error', { message: 'User ID is required to identify the staff user.' });
      }
      
      connectedStaff[userId] = socket.id;
      console.log(`Staff user ${userId} connected with socket ID: ${socket.id}`);
    });

    

    socket.on('Join_room', (conversationId, name) => {
      if (!conversationId) {
        return socket.emit('error', { message: 'Conversation ID is required to join a room.' });
      }

      username = name
      roomid = conversationId
      socket.join(conversationId);
      console.log(`User ${socket.id} joined room: ${conversationId}`);
      socket.emit('room_joined', { roomId: conversationId });
    });

    socket.on('Send_message', ({ conversationId, message, sender, createdAt }) => {
      if (!conversationId || !message || !sender) {
        return socket.emit('error', { message: 'Conversation ID, sender, and message are required.' });
      }

      console.log(`Message from ${sender} in room ${conversationId}: ${message}`);
      socket.to(conversationId).emit('Receive_message', { sender, message, createdAt });
    });

    socket.on('New_conversation_created', (conversationData) => {
      for (let userId in connectedStaff) {
        io.to(connectedStaff[userId]).emit('New_conversation_notification', conversationData);
      }
    });


    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id, roomid);
    
      // Check if roomid is valid
      if (!roomid) {
        console.error('Room ID is missing. Cannot save system message.');
        return;
      }
    
      // Emit a message to the room that the user has disconnected
      io.to(roomid).emit('Receive_message', {
        sender: 'System',
        type: 'System',
        message: `${username} has disconnected. Please hold while we reconnect you. Thank you for your patience!`,
        createdAt: new Date().toISOString(),
      });
    
      try {
        // Save the system message to the database
        await SupportMessage.create({
          conversation: roomid, // Ensure this is a valid conversation ID
          message: `${username} has disconnected. Please hold while we reconnect you. Thank you for your patience!` ,
          type: 'System',
          sender: {
            userType: 'System', // Ensure 'System' is a valid enum value in your schema
            anonymousName: '',
          },
        });
        console.log('System message saved successfully.');
      } catch (error) {
        console.error('Error saving system message:', error);
      }
    });



  });
};

module.exports = sockethandler;