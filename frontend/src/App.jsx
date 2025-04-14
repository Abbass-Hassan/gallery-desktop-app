import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Home from "./pages/Home/Home.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  const onLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const onRegisterSuccess = (registeredUser) => {
    setUser(registeredUser);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={onLoginSuccess} />} />
        <Route
          path="/register"
          element={<Register onRegisterSuccess={onRegisterSuccess} />}
        />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/chat" element={<Chat user={user} />} />
      </Routes>
    </Router>
  );
};

export default App;
