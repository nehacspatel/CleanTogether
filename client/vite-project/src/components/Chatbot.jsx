// src/components/Chatbot.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/Chatbot.css'; // Make sure this path is correct

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post('http://localhost:5001/api/chat', {
        message: input,
      });

     const reply = response.data?.reply || "Sorry, I didn't understand that.";
      setMessages([...newMessages, { sender: 'assistant', text: reply }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages([...newMessages, { sender: 'assistant', text: '⚠️ Server not responding.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            🤖 AI Assistant
            <button className="minimize-btn" onClick={() => setIsOpen(false)}>–</button>
          </div>

          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>💬</button>
      )}
    </div>
  );
}

export default Chatbot;
