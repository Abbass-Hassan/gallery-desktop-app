require("dotenv").config();

// Configuration object
const config = {
  // Server settings
  port: process.env.PORT || 80,

  // Database settings
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "gallery-desktop-app",
    port: process.env.DB_PORT || 3306,
  },

  // CORS settings
  cors: {
    origin: "*", // Allow all origins for now
  },
};

module.exports = config;
