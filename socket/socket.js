

const sockethandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
      
        // Handle joining a room
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
      
      
        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
        });
      });
};

module.exports = sockethandler