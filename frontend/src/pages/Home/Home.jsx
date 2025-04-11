import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import PhotoGallery from "../../components/PhotoGallery/PhotoGallery";
import "./Home.css";

const Home = ({ user }) => {
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!localStorage.getItem("authToken") && !user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="home-container">
      <Header user={user} />
      <PhotoGallery />
    </div>
  );
};

export default Home;
