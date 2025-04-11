import React from "react";
import "./Home.css";

const Home = ({ user }) => {
  return (
    <div className="home-container">
      <h2>Home Page</h2>
      {user ? <p>Welcome, {user.name}!</p> : <p>Please login or register.</p>}
    </div>
  );
};

export default Home;
