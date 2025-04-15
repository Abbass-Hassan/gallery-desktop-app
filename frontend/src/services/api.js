import axios from "axios";

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: "http://35.180.10.197:8000/api", // Base URL for your Laravel backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token (if available)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
