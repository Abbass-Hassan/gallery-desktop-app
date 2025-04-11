import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";

const Register = ({ onRegisterSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      onRegisterSuccess(user);
      navigate("/home");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const messages = Object.values(errors).flat().join(" ");
        setError(messages);
      } else {
        setError("Registration failed");
      }
    }
  };

  return (
    <div className="register-page">
      <div className="container register-container">
        <div className="form-box register-form-box">
          <h2 className="register-title">Create Account</h2>
          <p className="subtext register-subtext">Join our gallery community</p>

          {error && <p className="error-message">{error}</p>}

          <form
            id="registerForm"
            className="register-form"
            onSubmit={handleSubmit}
          >
            <div className="input-group register-input-group">
              <input
                type="text"
                id="name"
                className="register-input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group register-input-group">
              <input
                type="email"
                id="email"
                className="register-input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group register-input-group">
              <input
                type="password"
                id="password"
                className="register-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group register-input-group">
              <input
                type="password"
                id="passwordConfirmation"
                className="register-input"
                placeholder="Confirm Password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn register-btn">
              Create Account
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
