// Import required modules
const express = require("express");
const http = require("http");
const config = require("./config");
const { initDatabase } = require("./database");
const { setupSocketHandlers } = require("./socket-handler");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize database
initDatabase();

// Set up Socket.io
setupSocketHandlers(server);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Chat server is running");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server
const PORT = config.port;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chat server running on port ${PORT}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
});

// Handle unhandled exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
