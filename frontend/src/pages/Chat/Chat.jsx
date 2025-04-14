import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import ChatRoom from "../../components/ChatRoom/ChatRoom";
import "./Chat.css"; // New or updated CSS for overall page container

const Chat = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("authToken") && !user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="chat-page-wrapper">
      <Header user={user} />
      <div className="chat-page-content">
        <ChatRoom user={user} />
      </div>
    </div>
  );
};

export default Chat;
