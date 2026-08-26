import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import {
  Sparkles,
  Bot,
  User,
  Send,
  Copy,
  Check,
  Trash2,
  MoreVertical,
  MessageSquarePlus,
  ChevronLeft,
  Moon,
  Sun,
  Settings,
  Zap,
  Code2,
  PenLine,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  CornerDownLeft,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Clock,
  MessageSquare,
  Hash,
} from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    { icon: Code2, label: 'Write code', color: '#4f46e5', prompt: 'Write a React component for a todo list with Tailwind' },
    { icon: PenLine, label: 'Draft email', color: '#0891b2', prompt: 'Draft a professional email requesting time off' },
    { icon: BarChart3, label: 'Analyze data', color: '#059669', prompt: 'Explain how to analyze quarterly sales trends' },
    { icon: Lightbulb, label: 'Brainstorm', color: '#d97706', prompt: 'Give me 10 creative startup ideas' },
  ];

  const history = [
    { title: 'General Conversation', count: messages.length, active: true },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleSend = async (overrideText) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    }]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isConsecutive = (index) => {
    if (index === 0) return false;
    return messages[index].role === messages[index - 1].role;
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-badge">
              <Sparkles size={18} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Fritz AI</span>
              <span className="brand-tag">Pro</span>
            </div>
          </div>

          <button className="new-chat-btn" onClick={clearChat}>
            <div className="new-chat-icon">
              <MessageSquarePlus size={18} />
            </div>
            <span>New Chat</span>
            <div className="kbd-hint">
              <CornerDownLeft size={12} />
            </div>
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="section-header">
            <Hash size={13} />
            <span>Recent Chats</span>
          </div>
          <div className="history-list">
            {history.map((item, i) => (
              <div key={i} className={`history-item ${item.active ? 'active' : ''}`}>
                <div className="history-glow" />
                <MessageSquare size={15} className="history-icon" />
                <div className="history-body">
                  <span className="history-title">{item.title}</span>
                  <span className="history-meta">{item.count} messages</span>
                </div>
                {item.active && <div className="history-active-dot" />}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          <button className="menu-item" onClick={() => setDarkMode(!darkMode)}>
            <div className="menu-icon">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </div>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="menu-item">
            <div className="menu-icon">
              <Settings size={16} />
            </div>
            <span>Settings</span>
          </button>
          <div className="user-chip">
            <div className="user-avatar-mini">
              <User size={14} />
            </div>
            <div className="user-info">
              <span className="user-name">Melvin Suan</span>
              <span className="user-plan">Premium</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button className="header-btn" onClick={() => setShowSidebar(!showSidebar)}>
              <ChevronLeft size={18} style={{ transform: showSidebar ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }} />
            </button>
            <div className="header-title-group">
              <div className="header-avatar">
                <Bot size={18} />
              </div>
              <div>
                <div className="header-title">AI Assistant</div>
                <div className="header-subtitle">
                  <span className="live-dot" />
                  <span>Always online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn" title="Clear chat" onClick={clearChat}>
              <RotateCcw size={16} />
            </button>
            <button className="header-btn" title="More">
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        <div className="chat-scroll">
          <div className="chat-bg" />

          {/* WELCOME SCREEN */}
          {messages.length === 1 && messages[0].role === 'assistant' && (
            <div className="welcome-wrap">
              <div className="welcome-hero">
                <div className="hero-ring">
                  <div className="hero-ring-inner">
                    <Sparkles size={32} />
                  </div>
                </div>
                <div className="hero-badge">
                  <Zap size={12} />
                  <span>Fritz AI</span>
                </div>
                <h1 className="hero-title">
                  Hi, This is Fritz AI.<br />
                  How can I help you today?
                </h1>
                <p className="hero-desc">
                  Ask me anything — coding, writing, analysis,<br />
                  brainstorming, or just a chat.
                </p>
              </div>

              <div className="suggestion-grid">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-tile"
                    onClick={() => handleSend(s.prompt)}
                    style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                  >
                    <div className="tile-accent" style={{ background: s.color }} />
                    <div className="tile-icon" style={{ color: s.color, background: s.color + '12' }}>
                      <s.icon size={20} />
                    </div>
                    <div className="tile-body">
                      <span className="tile-label">{s.label}</span>
                      <span className="tile-desc">{s.prompt.slice(0, 38)}...</span>
                    </div>
                    <ArrowUpRight size={15} className="tile-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGE FEED */}
          <div className="message-list">
            {messages.map((msg, index) => {
              const consecutive = isConsecutive(index);
              return (
                <div
                  key={msg.id}
                  className={`msg-row ${msg.role} ${consecutive ? 'consecutive' : ''}`}
                >
                  {!consecutive && (
                    <div className="msg-avatar-wrap">
                      <div className={`msg-avatar ${msg.role}`}>
                        {msg.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
                      </div>
                    </div>
                  )}
                  {consecutive && <div className="msg-avatar-spacer" />}

                  <div className="msg-body">
                    {!consecutive && (
                      <div className="msg-meta">
                        <span className="msg-author">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                        <span className="msg-time">
                          <Clock size={11} />
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className="msg-bubble">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            h1: ({ node, ...props }) => <h1 className="markdown-h1" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="markdown-h2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="markdown-h3" {...props} />,
                            p: ({ node, ...props }) => <p className="markdown-p" {...props} />,
                            ul: ({ node, ...props }) => <ul className="markdown-ul" {...props} />,
                            ol: ({ node, ...props }) => <ol className="markdown-ol" {...props} />,
                            li: ({ node, ...props }) => <li className="markdown-li" {...props} />,
                            code: ({ node, inline, ...props }) =>
                              inline ? (
                                <code className="markdown-inline-code" {...props} />
                              ) : (
                                <pre className="markdown-code-block">
                                  <code {...props} />
                                </pre>
                              ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="markdown-p">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === 'assistant' && (
                      <div className="msg-toolbar">
                        <button
                          className="tool-btn"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button className="tool-btn" title="Like">
                          <ThumbsUp size={13} />
                        </button>
                        <button className="tool-btn" title="Dislike">
                          <ThumbsDown size={13} />
                        </button>
                        <button className="tool-btn" title="Share">
                          <Share2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="msg-row assistant">
                <div className="msg-avatar-wrap">
                  <div className="msg-avatar assistant">
                    <Sparkles size={15} />
                  </div>
                </div>
                <div className="msg-body">
                  <div className="msg-meta">
                    <span className="msg-author">AI Assistant</span>
                  </div>
                  <div className="typing-box">
                    <div className="typing-wave">
                      <span /><span /><span />
                    </div>
                    <span className="typing-label">Thinking</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT FORM */}
        <div className="chat-footer">
          <div className="input-shell">
            <div className="input-box">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className={`send-fab ${input.trim() && !isLoading ? 'active' : ''}`}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
              >
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
          <p className="footer-note">AI can make mistakes. Consider verifying important information.</p>
        </div>
      </main>
    </div>
  );
}

export default App;