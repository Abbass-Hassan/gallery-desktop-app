require("dotenv").config();

// Configuration object
const config = {
  // Server settings
  port: process.env.PORT || 3001,

  // Database settings
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "gallery-desktop-app",
  },

  // CORS settings
  cors: {
    origin: "*", // Allow all origins for now
  },
};

module.exports = config;
