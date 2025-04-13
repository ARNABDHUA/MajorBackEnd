const express = require('express');
const mainRoutes = require("./routes/mainRoutes");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");
const fileupload =require("express-fileupload");
const path =require("path");
const cors = require("cors");

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Allow requests from your frontend
app.use(cors({
  origin: '*', 
  credentials: true 
}));

app.use(express.json());


app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: path.join(path.resolve(), 'temp'),
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit for videos
  })
);

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



//payment 

// Configuration for Cashfree API
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BASE_URL = "https://sandbox.cashfree.com/pg/orders"; // Use 'https://api.cashfree.com/pg/orders' for production

function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);
  const orderId = hash.digest("hex");
  return orderId.substr(0, 12);
}


app.post("/payment", async (req, res) => {
  try {
    const orderId = await generateOrderId();
    const {userId,name,email,phone}= req.body

    // Create order using direct API calls instead of SDK
    const orderData = {
      order_id: orderId,
      order_amount: 10000.0,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: name,
        customer_email:email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: "http://localhost:5173?order_id={order_id}",
        notify_url: "https://webhook.site", // Replace with your webhook URL if needed
      },
    };

    const response = await axios.post(BASE_URL, orderData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
      },
    });

    // console.log("Order created:", response.data);
    res.json(response.data);
  } catch (error) {
    console.log(
      "Error creating order:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

app.post("/verify", async (req, res) => {
  try {
    let { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Get payment details using direct API call
    const response = await axios.get(`${BASE_URL}/${orderId}/payments`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
      },
    });

    // console.log("Payment details:", response.data);
    res.json(response.data);
  } catch (error) {
    console.log(
      "Error verifying payment:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

// const PORT = 3000;
// const server=app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


const PORT = process.env.PORT || 10000;

// MUST bind to 0.0.0.0
const server=app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
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


//okkk

