import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Home, Users } from "lucide-react";
import "./Header.css";

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const displayName = user?.name || localStorage.getItem("userName") || "Guest";

  return (
    <header className="header">
      <div className="welcome-container">
        <h2 className="welcome-text">
          Welcome, <span className="user-name">{displayName}</span>
        </h2>
      </div>

      <div className="nav-links">
        <Link to="/home" className="nav-link">
          <Home size={20} />
          <span>Your Gallery</span>
        </Link>

        <Link to="/chat" className="nav-link">
          <Users size={20} />
          <span>Community</span>
        </Link>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
