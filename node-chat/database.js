// Import MySQL
const mysql = require("mysql2");
const config = require("./config");

// Create database connection pool
const db = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
});

// Initialize database tables
function initDatabase() {
  // Create chat_messages table if it doesn't exist
  db.query(
    `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      username VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating chat_messages table:", err);
      } else {
        console.log("Database initialized successfully");
      }
    }
  );
}

// Get recent messages
function getRecentMessages(callback) {
  db.query(
    "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50",
    (err, results) => {
      if (err) {
        console.error("Error fetching messages:", err);
        callback(err, null);
        return;
      }
      // Return oldest messages first
      callback(null, results.reverse());
    }
  );
}

// Create a new message
function createMessage(userId, username, message, callback) {
  db.query(
    "INSERT INTO chat_messages (user_id, username, message) VALUES (?, ?, ?)",
    [userId, username, message],
    (err, result) => {
      if (err) {
        console.error("Error creating message:", err);
        callback(err, null);
        return;
      }

      // Get the inserted message
      db.query(
        "SELECT * FROM chat_messages WHERE id = ?",
        [result.insertId],
        (err, rows) => {
          if (err) {
            console.error("Error retrieving message:", err);
            callback(err, null);
            return;
          }
          callback(null, rows[0]);
        }
      );
    }
  );
}

module.exports = {
  db,
  initDatabase,
  getRecentMessages,
  createMessage,
};
