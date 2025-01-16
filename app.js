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

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = require("socket.io")(server, {
    cors: corsConfig, // Use the same CORS configuration for Socket.IO
});

// Connect to MongoDB
mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
        initialize();
        console.log("MongoDB Connected");
    })
    .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 }));
app.use(cookieParser());

// Routes
require("./routes")(app);

// Socket.IO Logic
const socketSetup = require('./socket/socket'); // Correct path to socket.js
socketSetup(io); // Pass the `io` instance to the socket setup

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port: ${port}`));