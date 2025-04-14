// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

// Create the Express app and HTTP server.
const app = express();
const server = http.createServer(app);

// Create a Socket.io server.
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now (adjust this for production)
  },
});

// Create a MySQL connection pool.
const db = mysql.createPool({
  host: "localhost",
  user: "root", // Replace with your MySQL user
  password: "Abbas297$", // Replace with your MySQL password
  database: "gallery-desktop-app", // Replace with your database name
});

// Create (or ensure) the chat_messages table exists.
db.query(
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  (err, results) => {
    if (err) {
      console.error("Error creating chat_messages table:", err);
    } else {
      console.log("chat_messages table ensured");
    }
  }
);

// Serve a simple route for testing.
app.get("/", (req, res) => {
  res.send("Chat server is running.");
});

// Socket.io connection handler.
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Load the last 50 messages from the database and send them to the client.
  db.query(
    "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50",
    (err, results) => {
      if (err) {
        console.error("Error fetching messages:", err);
        return;
      }
      // Reverse the array so the oldest messages appear first.
      socket.emit("initialMessages", results.reverse());
    }
  );

  // Listen for new messages from clients.
  socket.on("sendMessage", (data) => {
    // Expect data: { user_id, username, message }
    const { user_id, username, message } = data;

    // Insert the message into the database.
    db.query(
      "INSERT INTO chat_messages (user_id, username, message) VALUES (?, ?, ?)",
      [user_id, username, message],
      (err, result) => {
        if (err) {
          console.error("Error inserting message:", err);
          return;
        }
        // Retrieve the newly inserted message (to include timestamp, etc.).
        db.query(
          "SELECT * FROM chat_messages WHERE id = ?",
          [result.insertId],
          (err, rows) => {
            if (err) {
              console.error("Error retrieving inserted message:", err);
              return;
            }
            const newMessage = rows[0];
            // Broadcast the new message to all connected clients.
            io.emit("newMessage", newMessage);
          }
        );
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server.
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server listening on port ${PORT}`);
});
