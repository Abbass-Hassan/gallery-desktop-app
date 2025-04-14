// Import socket.io
const { Server } = require("socket.io");
const { getRecentMessages, createMessage } = require("./database");
const config = require("./config");

// Set up socket handlers
function setupSocketHandlers(server) {
  // Create a Socket.io server
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"],
    },
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send recent messages to the client
    getRecentMessages((err, messages) => {
      if (err) {
        socket.emit("error", { message: "Failed to load messages" });
        return;
      }
      socket.emit("initialMessages", messages);
    });

    // Handle new messages from clients
    socket.on("sendMessage", (data) => {
      // Validate message data
      if (!isValidMessage(data)) {
        socket.emit("error", { message: "Invalid message format" });
        return;
      }

      const { user_id, username, message } = data;

      // Store message in database
      createMessage(user_id, username, message, (err, newMessage) => {
        if (err) {
          socket.emit("error", { message: "Failed to send message" });
          return;
        }

        // Broadcast the message to all clients
        io.emit("newMessage", newMessage);
      });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

// Helper function to validate message data
function isValidMessage(data) {
  // Check if data exists
  if (!data) return false;

  // Check required fields
  if (!data.user_id || !data.username || !data.message) return false;

  // Check if message is empty
  if (typeof data.message !== "string" || data.message.trim() === "")
    return false;

  return true;
}

module.exports = {
  setupSocketHandlers,
};
