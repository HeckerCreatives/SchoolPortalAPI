const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const { initialize } = require("./initialization/initialize");

const app = express();

const CORS_ALLOWED = process.env.ALLOWED_CORS;

const corsConfig = {
    origin: CORS_ALLOWED.split(" "),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Origin", "Content-Type", "X-Requested-With", "Accept", "Authorization"],
    credentials: true,
};

app.use(cors(corsConfig));
const server = http.createServer(app);
const io = require("socket.io")(server); // Initialize socket.io with the server

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    initialize();
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 }));
app.use(cookieParser());


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



// Routes
require("./routes")(app);

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port: ${port}`));
