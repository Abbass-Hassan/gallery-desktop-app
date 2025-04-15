import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./ChatRoom.css";

const SOCKET_SERVER_URL = "http://35.180.10.197:3001"; // EC2 Server IP

const ChatRoom = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);

  // Initialize Socket Connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      path: "/socket.io", // Important for Docker / Server
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("✅ WebSocket Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ WebSocket Disconnected:", reason);
    });

    socket.on("initialMessages", (initialMessages) => {
      setMessages(initialMessages);
      scrollToBottom();
    });

    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      scrollToBottom();
    });
  }, [socket]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || !socket || !user) return;

    const messageData = {
      user_id: user.id,
      username: user.name,
      message: input.trim(),
    };

    socket.emit("sendMessage", messageData);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <h2 className="chat-room-title">Gallery Community</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isCurrentUser = msg.user_id === user.id;
          return (
            <div
              key={msg.id}
              className={`chat-message ${isCurrentUser ? "my-message" : ""}`}
            >
              {!isCurrentUser && (
                <span className="chat-username">
                  {msg.username}
                  <br />
                </span>
              )}

              <div className="bubble">
                <span className="chat-text">{msg.message}</span>
                <span className="chat-timestamp">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
