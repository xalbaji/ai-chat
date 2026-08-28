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
  Search,
  Images,
  Plug,
  Telescope,
  PanelLeft,
  ChevronDown,
  ExternalLink,
  CircleHelp,
  LogIn,
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
import { AppLogo } from './components/AppLogo';

export default function App() {
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
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';

    setIsActivelyTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsActivelyTyping(false);
    }, 1500);
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) handleFileSelect(file);
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

  const getSimulatedResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('todo') || lower.includes('react')) {
      return `Here is a clean React component for a Todo list built with Tailwind CSS:

\`\`\`jsx
import React, { useState } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Explore interactive fluid canvas background', done: true },
    { id: 2, text: 'Connect JIM AI Assistant API', done: false }
  ]);
  const [text, setText] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }]);
    setText('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 outline-none focus:border-indigo-500"
        />
        <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg">
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
\`\`\`
Let me know if you'd like me to add local storage persistence or filtering!`;
    }

    if (lower.includes('email') || lower.includes('time off')) {
      return `### Subject: Time Off Request – Melvin Suan

Dear [Manager's Name],

I am writing to formally request time off from **[Start Date]** to **[End Date]** for personal reasons. 

Before departing, I will ensure that:
1. All critical deliverables and ongoing sprint tasks are up-to-date.
2. My team members are briefed on ongoing coverage.
3. Relevant handoff documents are shared in our team repository.

Thank you for considering my request. Please let me know if you need any additional details.

Best regards,  
**Melvin Suan**`;
    }

    if (lower.includes('startup') || lower.includes('ideas')) {
      return `Here are **4 high-potential startup ideas** combining modern AI and interactive UX:

1. **Ambient Flow AI**: Real-time fluid neural backgrounds that dynamically visualize biometric focus and brainwave states during deep work sessions.
2. **AutoDoc Synthesizer**: AI pipeline transforming engineering architecture diagrams directly into verified codebases and infrastructure templates.
3. **Adaptive Canvas Tutor**: Interactive STEM learning platform using physics engines and interactive mathematical formulas ($$E = mc^2$$).
4. **Contextual Meeting Agent**: Autonomous meeting note summarizer with instant action-item delegation into Jira/Linear.`;
    }

    return `I received your prompt: **"${text}"**. 

How would you like to proceed? I can help you:
- 🛠️ Write or debug code in JavaScript, React, Python, etc.
- 🎨 Design interactive UI components and animated backgrounds.
- 📊 Analyze data patterns or brainstorm creative concepts.`;
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

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        generatedImage: data.generatedImage || null,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Fallback AI response simulation if backend API is offline
      await new Promise((resolve) => setTimeout(resolve, 800));
      const simulatedReply = getSimulatedResponse(userMsg.content);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: simulatedReply,
          timestamp: new Date(),
        },
      ]);
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
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isConsecutive = (index) => {
    if (index === 0) return false;
    return messages[index].role === messages[index - 1].role;
  };

  const isWelcomeVisible = messages.length === 1 && messages[0].role === 'assistant';
  const isUserTyping = input.trim().length > 0 || isActivelyTyping;

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-badge">
              <AppLogo size={25} rounded="7px" glow={false} />
            </div>
            <button className="sidebar-collapse-btn" onClick={() => setShowSidebar(false)} aria-label="Close sidebar">
              <PanelLeft size={18} strokeWidth={1.7} />
            </button>
          </div>

          <button className="new-chat-btn" onClick={clearChat}>
            <MessageSquarePlus size={18} strokeWidth={1.8} />
            <span>New chat</span>
          </button>

          <button className="nav-item"><Search size={18} strokeWidth={1.8} /><span>Search chats</span></button>
          <button className="nav-item"><Images size={18} strokeWidth={1.8} /><span>Images</span></button>
          <button className="nav-item"><Plug size={18} strokeWidth={1.8} /><span>Plugins</span></button>
          <button className="nav-item"><Telescope size={18} strokeWidth={1.8} /><span>Deep research</span></button>
        </div>

        <div className="sidebar-scroll">
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
          <button className="menu-item">
            <span><span className="menu-icon"><Sparkles size={17} strokeWidth={1.8} /></span>See plans and pricing</span>
            <ExternalLink size={14} strokeWidth={1.8} />
          </button>
          <button className="menu-item"><span><span className="menu-icon"><Settings size={17} strokeWidth={1.8} /></span>Settings</span></button>
          <button className="menu-item"><span><span className="menu-icon"><CircleHelp size={17} strokeWidth={1.8} /></span>Help</span><ExternalLink size={14} strokeWidth={1.8} /></button>
          <div className="login-prompt">
            <strong>Get responses tailored to you</strong>
            <p>Log in to get answers based on saved chats, plus create images and upload files.</p>
            <button className="login-btn"><LogIn size={16} strokeWidth={1.8} />Log in</button>
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
              <PanelLeft size={18} strokeWidth={1.7} />
            </button>
            <div className="header-title-group">
              <div className="header-title">JIM AI <ChevronDown size={15} strokeWidth={1.8} /></div>
            </div>
          </div>
          <div className="header-actions">
            <button className="auth-btn login">Log in</button>
            <button className="auth-btn signup">Sign up for free</button>
          </div>
        </header>

        <div className="chat-scroll">
          {/* WELCOME SCREEN */}
          {isWelcomeVisible && (
            <div className="welcome-wrap">
              <div className="welcome-hero">
                <div className="hero-mark">
                  <AppLogo size={44} rounded="14px" glow={true} />
                </div>
                <h1 className="hero-title">
                  How can I help you <br />
                  <span className="italic-text">today, Melvin?</span>
                </h1>
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
          {!isWelcomeVisible && (
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
                          {msg.role === 'user' ? (
                            'MS'
                          ) : (
                            <AppLogo size={36} rounded="12px" glow={false} />
                          )}
                        </div>
                      </div>
                    )}
                    {consecutive && <div className="msg-avatar-spacer" />}

                    <div className="msg-body">
                      {!consecutive && (
                        <div className="msg-meta">
                          <span className="msg-author">
                            {msg.role === 'user' ? 'Melvin Suan' : 'JIM AI'}
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
                              h1: ({ ...props }) => <h1 className="markdown-h1" {...props} />,
                              h2: ({ ...props }) => <h2 className="markdown-h2" {...props} />,
                              h3: ({ ...props }) => <h3 className="markdown-h3" {...props} />,
                              p: ({ ...props }) => <p className="markdown-p" {...props} />,
                              ul: ({ ...props }) => <ul className="markdown-ul" {...props} />,
                              ol: ({ ...props }) => <ol className="markdown-ol" {...props} />,
                              li: ({ ...props }) => <li className="markdown-li" {...props} />,
                              code: ({ className, children, ...props }) => {
                                const isInline = !className && typeof children === 'string' && !children.includes('\n');
                                return isInline ? (
                                  <code className="markdown-inline-code" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="markdown-code-block">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
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
                      <AppLogo size={36} rounded="12px" glow={true} />
                    </div>
                  </div>
                  <div className="msg-body">
                    <div className="typing-box">
                      <div className="typing-wave">
                        <span /><span /><span />
                      </div>
                      <span className="typing-label">Neural Synthesis in Progress...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className="chat-footer">
          {/* DYNAMIC STATUS BAR */}
          {(isUserTyping || isLoading) && (
            <div className="chat-status-bar">
              {isUserTyping && !isLoading && (
                <div className="status-pill typing">
                  <span className="pill-pulse-dot" />
                  <span>Neural Pulse Active · Drafting prompt...</span>
                </div>
              )}
              {isLoading && (
                <div className="status-pill processing">
                  <span className="pill-pulse-dot" />
                  <span>3D Neural Core synthesizing response...</span>
                </div>
              )}
            </div>
          )}

          <div
            className={`input-shell ${isUserTyping && !isLoading ? 'is-typing neural-pulse' : ''} ${isLoading ? 'is-processing' : ''}`}
          >
            {isLoading && <div className="processing-indicator-line" />}

            {imagePreview && (
              <div className="image-preview-bar">
                <div className="image-preview-thumb">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    className="image-preview-remove"
                    onClick={removeSelectedImage}
                    title="Remove image"
                  >
                    <X size={12} />
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
                className="input-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
                type="button"
              >
                <Paperclip size={18} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  isLoading
                    ? 'AI is generating a response...'
                    : 'Message JIM AI Assistant...'
                }
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
