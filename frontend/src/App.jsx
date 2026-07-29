import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat state
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Standard fetch call to backend API
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const botReply = data.reply || data.error || 'No response received from backend.';

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error: Unable to connect to backend server.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="header-title">
          <Sparkles className="header-icon" size={22} />
          <h1>Simple AI Chatbot</h1>
        </div>
        <p>Student Activity Starter</p>
      </header>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <div className="avatar">
              {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message bot loading">
            <div className="avatar">
              <Bot size={18} />
            </div>
            <div className="message-content loading-content">
              <Loader2 className="spinner" size={16} />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

export default App;
