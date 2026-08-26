import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import {
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  RotateCcw,
  MoreVertical,
  MessageSquarePlus,
  ChevronLeft,
  Moon,
  Sun,
  Settings,
  Code2,
  PenLine,
  BarChart3,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Clock,
  MessageSquare,
  Hash,
  Paperclip,
  X,
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        handleFileSelect(file);
        break;
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (overrideText) => {
    const text = overrideText || input;
    if ((!text.trim() && !selectedImage) || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      image: imagePreview,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    const formData = new FormData();
    formData.append('message', userMsg.content);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    formData.append(
      'history',
      JSON.stringify(
        messages
          .filter((m) => m.id !== 1)
          .map((m) => ({ role: m.role, content: m.content }))
      )
    );

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        generatedImage: data.generatedImage || null,
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

  const isWelcomeVisible = messages.length === 1 && messages[0].role === 'assistant';

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-badge">
              <Sparkles size={16} strokeWidth={2} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Fritz AI</span>
              <span className="brand-tag">Pro</span>
            </div>
          </div>

          <button className="new-chat-btn" onClick={clearChat}>
            <div className="new-chat-icon">
              <MessageSquarePlus size={16} strokeWidth={2} />
            </div>
            <span>New Chat</span>
            <span className="kbd-hint">⌘K</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="section-header">
            <Hash size={12} strokeWidth={2.5} />
            <span>Recent Chats</span>
          </div>
          <div className="history-list">
            {history.map((item, i) => (
              <div key={i} className={`history-item ${item.active ? 'active' : ''}`}>
                <MessageSquare size={14} strokeWidth={2} className="history-icon" />
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
          <button className="menu-item" onClick={() => setDarkMode(!darkMode)}>
            <div className="menu-icon">
              {darkMode ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
            </div>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="menu-item">
            <div className="menu-icon">
              <Settings size={15} strokeWidth={2} />
            </div>
            <span>Settings</span>
          </button>
          <div className="user-chip">
            <div className="user-avatar-mini">MS</div>
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
            <button
              className="header-btn"
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}
            >
              <ChevronLeft
                size={18}
                strokeWidth={1.5}
                style={{
                  transform: showSidebar ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </button>
            <div className="header-title-group">
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
            <button
              className="header-btn"
              title="Clear chat"
              onClick={clearChat}
              aria-label="Clear chat"
            >
              <RotateCcw size={15} strokeWidth={1.5} />
            </button>
            <button
              className="header-btn"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical size={15} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="chat-scroll">
          {/* WELCOME SCREEN */}
          {isWelcomeVisible && (
            <div className="welcome-wrap">
              <div className="welcome-hero">
                <div className="hero-mark">
                  <Sparkles size={20} strokeWidth={2} />
                </div>
                <h1 className="hero-title">How can I help you today?</h1>
                <p className="hero-desc">
                  Ask me anything — coding, writing, analysis, brainstorming, or image generation.
                </p>
              </div>

              <div className="suggestion-grid">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-tile"
                    onClick={() => handleSend(s.prompt)}
                    style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                  >
                    <div className="tile-dot" style={{ background: s.color }} />
                    <div className="tile-body">
                      <span className="tile-label">{s.label}</span>
                      <span className="tile-desc">{s.prompt}</span>
                    </div>
                    <ArrowUpRight size={14} strokeWidth={2} className="tile-arrow" />
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
                        {msg.role === 'user' ? 'MS' : <Sparkles size={14} strokeWidth={2} />}
                      </div>
                    </div>
                  )}
                  {consecutive && <div className="msg-avatar-spacer" />}

                  <div className="msg-body">
                    {!consecutive && (
                      <div className="msg-meta">
                        <span className="msg-author">
                          {msg.role === 'user' ? 'Melvin Suan' : 'Fritz AI'}
                        </span>
                        <span className="msg-time">
                          <Clock size={10} strokeWidth={2} />
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className="msg-bubble">
                      {msg.image && (
                        <div className="msg-image-attachment">
                          <img src={msg.image} alt="Uploaded attachment" />
                        </div>
                      )}

                      {msg.generatedImage && (
                        <div className="msg-generated-image">
                          <img src={msg.generatedImage} alt="Generated content" />
                        </div>
                      )}

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
                          title="Copy to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <Check size={12} strokeWidth={2} />
                          ) : (
                            <Copy size={12} strokeWidth={2} />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button className="tool-btn" title="Helpful">
                          <ThumbsUp size={12} strokeWidth={2} />
                        </button>
                        <button className="tool-btn" title="Not helpful">
                          <ThumbsDown size={12} strokeWidth={2} />
                        </button>
                        <button className="tool-btn" title="Share">
                          <Share2 size={12} strokeWidth={2} />
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
                    <Sparkles size={14} strokeWidth={2} />
                  </div>
                </div>
                <div className="msg-body">
                  <div className="msg-meta">
                    <span className="msg-author">Fritz AI</span>
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
            {imagePreview && (
              <div className="image-preview-bar">
                <div className="image-preview-thumb">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    className="image-preview-remove"
                    onClick={removeSelectedImage}
                    aria-label="Remove image"
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            <div className="input-box">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="input-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
                aria-label="Attach image"
              >
                <Paperclip size={18} strokeWidth={1.5} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Message AI Assistant..."
                rows={1}
                disabled={isLoading}
                aria-label="Message input"
              />
              <button
                className={`send-fab ${(input.trim() || selectedImage) && !isLoading ? 'active' : ''}`}
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                aria-label="Send message"
              >
                <ArrowUpRight size={18} strokeWidth={2} />
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