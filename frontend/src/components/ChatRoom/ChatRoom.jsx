import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./ChatRoom.css";

const SOCKET_SERVER_URL = "http://localhost:3001"; // Adjust if needed

const ChatRoom = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);

  // Initialize the socket connection.
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });
    setSocket(newSocket);

    // Clean up on unmount.
    return () => newSocket.close();
  }, []);

  // Listen for messages.
  useEffect(() => {
    if (socket) {
      // When connected, receive initial messages.
      socket.on("initialMessages", (initialMessages) => {
        setMessages(initialMessages);
        scrollToBottom();
      });

      // Listen for new messages.
      socket.on("newMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      });
    }
  }, [socket]);

  // Scroll the messages container to the bottom.
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle sending a new message.
  const handleSendMessage = () => {
    if (input.trim() !== "" && socket && user) {
      const messageData = {
        user_id: user.id,
        username: user.name, // or user.username, whichever you're using
        message: input.trim(),
      };
      socket.emit("sendMessage", messageData);
      setInput("");
    }
  };

  // Handle Enter key for sending a message.
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <h2 className="chat-room-title">Group Chat</h2>
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
