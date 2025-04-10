const express = require('express');
const mainRoutes = require("./routes/mainRoutes");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const cors = require("cors");

// Allow requests from your frontend
app.use(cors({
  origin: '*', 
  credentials: true 
}));

app.use(express.json());

// const MONGO_URI = "mongodb+srv://majorproject:YV2MuvkCZu9UsY2K@major.o7qez.mongodb.net/?retryWrites=true&w=majority&appName=Major";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";

mongoose.connect(MONGO_URI)
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((error) => {
  console.error("MongoDB connection error:", error);
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use("/v1", mainRoutes);

const PORT = 3000;
const server=app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
