

const connectedStaff = {}; 

const sockethandler = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('Staff_connected', (userId) => {
      if (!userId) {
        return socket.emit('error', { message: 'User ID is required to identify the staff user.' });
      }
      
      connectedStaff[userId] = socket.id;
      console.log(`Staff user ${userId} connected with socket ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (let userId in connectedStaff) {
        if (connectedStaff[userId] === socket.id) {
          delete connectedStaff[userId];
          console.log(`Staff user ${userId} disconnected`);
          break;
        }
      }
    });

    socket.on('Join_room', (conversationId) => {
      if (!conversationId) {
        return socket.emit('error', { message: 'Conversation ID is required to join a room.' });
      }

      socket.join(conversationId);
      console.log(`User ${socket.id} joined room: ${conversationId}`);
      socket.emit('room_joined', { roomId: conversationId });
    });

    socket.on('Send_message', ({ conversationId, message, sender }) => {
      if (!conversationId || !message || !sender) {
        return socket.emit('error', { message: 'Conversation ID, sender, and message are required.' });
      }

      console.log(`Message from ${sender} in room ${conversationId}: ${message}`);
      socket.to(conversationId).emit('Receive_message', { sender, message });
    });

    socket.on('New_conversation_created', (conversationData) => {
      for (let userId in connectedStaff) {
        io.to(connectedStaff[userId]).emit('New_conversation_notification', conversationData);
      }
    });
  });
};

module.exports = sockethandler;