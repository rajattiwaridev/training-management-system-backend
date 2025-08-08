const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const bodyParser = require("body-parser");
const { registerUser } = require("./controllers/authController");
require('./emitter/trainingListeners');
const app = express();
const path = require('path');

app.use('/node-backend/uploads', express.static(path.join(__dirname, 'uploads')));

// Establish Database Connection
dbConnect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error(`Failed to connect to the database: ${err.message}`);
    process.exit(1); // Exit process if DB connection fails
  });

mongoose.connection.once("open", async () => {
  try {
    await registerUser();
    console.log("✅ Default user registered.");
  } catch (err) {
    console.error("❌ Error registering default user:", err.message);
  }
});
// Middleware Configuration
app.use(express.json());
app.use(cors());

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the backend API!" });
});

// Auth Routes
app.use("/node-backend", authRoutes); // Updated path for better semantics

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 3001; // Use environment variable for PORT if available
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
