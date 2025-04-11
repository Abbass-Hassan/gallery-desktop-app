import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      onLoginSuccess(user);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="container login-container">
        <div className="form-box login-form-box">
          <h2 className="login-title">Welcome Back</h2>
          <p className="subtext login-subtext">Login to your gallery account</p>

          {error && <p className="error-message">{error}</p>}

          <form id="loginForm" className="login-form" onSubmit={handleSubmit}>
            <div className="input-group login-input-group">
              <input
                type="email"
                id="email"
                className="login-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group login-input-group">
              <input
                type="password"
                id="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn login-btn">
              Login
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
