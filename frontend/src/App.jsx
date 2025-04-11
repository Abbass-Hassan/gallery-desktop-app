import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Home from "./pages/Home/Home.jsx";
import "./App.css"; // Global styles if needed

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
      </Routes>
    </Router>
  );
};

export default App;
