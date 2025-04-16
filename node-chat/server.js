const express = require("express");
const http = require("http");
const config = require("./config");
const { initDatabase } = require("./database");
const { setupSocketHandlers } = require("./socket-handler");

// Setup application infrastructure
const app = express();
const server = http.createServer(app);

// Connect to database
initDatabase();

// Configure WebSocket communication
setupSocketHandlers(server);

// Base endpoint for service verification
app.get("/", (req, res) => {
  res.send("Chat server is running");
});

// Monitoring endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Launch server
const PORT = config.port;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chat server running on port ${PORT}`);
});

// Error handling for various failure scenarios
server.on("error", (error) => {
  console.error("Server error:", error);
});

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
