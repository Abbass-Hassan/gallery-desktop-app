const { Server } = require("socket.io");
const { getRecentMessages, createMessage } = require("./database");
const config = require("./config");

function setupSocketHandlers(server) {
  // Initialize Socket.IO with CORS settings
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send chat history to new client
    getRecentMessages((err, messages) => {
      if (err) {
        socket.emit("error", { message: "Failed to load messages" });
        return;
      }
      socket.emit("initialMessages", messages);
    });

    // Handle new messages
    socket.on("sendMessage", (data) => {
      if (!isValidMessage(data)) {
        socket.emit("error", { message: "Invalid message format" });
        return;
      }

      const { user_id, username, message } = data;

      // Save and broadcast message
      createMessage(user_id, username, message, (err, newMessage) => {
        if (err) {
          socket.emit("error", { message: "Failed to send message" });
          return;
        }

        io.emit("newMessage", newMessage);
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

// Validate message structure
function isValidMessage(data) {
  if (!data) return false;
  if (!data.user_id || !data.username || !data.message) return false;
  if (typeof data.message !== "string" || data.message.trim() === "")
    return false;
  return true;
}

module.exports = {
  setupSocketHandlers,
};
