require("dotenv").config();

const config = {
  // Server port configuration
  port: process.env.PORT || 80,

  // Database connection parameters
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "gallery-desktop-app",
    port: process.env.DB_PORT || 3306,
  },

  cors: {
    origin: "*",
  },
};

module.exports = config;
