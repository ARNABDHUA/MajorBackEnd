const express = require('express');
const mainRoutes = require("./routes/mainRoutes");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
app.use(express.json());

const MONGO_URI = "mongodb+srv://majorproject:YV2MuvkCZu9UsY2K@major.o7qez.mongodb.net/?retryWrites=true&w=majority&appName=Major";

// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
