import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageSquare,
  Plus,
  Settings,
  Moon,
  Sun,
  Send,
  Sparkles,
  Code2,
  Mail,
  BarChart3,
  Lightbulb,
  MoreVertical,
  Trash2,
  ChevronLeft,
  Bot,
  User,
  Clock,
  CheckCheck,
  Zap,
  Command,
  CornerDownLeft,
  Loader2,
  Pin,
  History,
  Search,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import './App.css';

/* ═══════════════════════════════════════════════════════════════
   FRITZ AI — Premium Chat Interface (MERN Ready)
   Files: App.jsx + App.css
   Backend: Express API at http://localhost:5000/api/chat
   Markdown: react-markdown + remark-gfm for rich formatting
   ═══════════════════════════════════════════════════════════════ */

const SUGGESTIONS = [
  {
    icon: Code2,
    title: 'Write code',
    desc: 'Write a React component for a dashboard with charts and tables',
    accent: 'indigo'
  },
  {
    icon: Mail,
    title: 'Draft email',
    desc: 'Draft a professional email to request a project deadline extension',
    accent: 'emerald'
  },
  {
    icon: BarChart3,
    title: 'Analyze data',
    desc: 'Explain how to analyze sales trends using Python and Pandas',
    accent: 'amber'
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm',
    desc: 'Give me 10 startup ideas for AI-powered productivity tools in 2026',
    accent: 'rose'
  }
];

const CHAT_HISTORY = [
  { id: 1, label: 'General Conversation', icon: MessageSquare, active: true, time: '2m ago', pinned: true },

];

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: "Hello! I'm your AI assistant. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    status: 'read'
  }
];

/* ─── Sub-Components ─── */

const StatusDot = ({ status = 'online' }) => (
  <span className="status-dot-wrapper">
    {status === 'online' && <span className={`status-ping status-${status}`} />}
    <span className={`status-dot status-${status}`} />
  </span>
);

const SidebarItem = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}>
      {active && <div className="sidebar-active-indicator" />}
      <div className={`sidebar-item-icon ${active ? 'sidebar-item-icon-active' : ''}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="sidebar-item-content">
        <span className="sidebar-item-label">{item.label}</span>
        <span className="sidebar-item-meta">{item.time}</span>
      </div>
      {item.pinned && <Pin size={12} className="sidebar-item-pin" />}
    </button>
  );
};

const SuggestionCard = ({ item, index, onClick }) => {
  const Icon = item.icon;
  const accentMap = {
    indigo: { bg: 'suggestion-bg-indigo', icon: 'suggestion-icon-indigo', orb: 'suggestion-orb-indigo' },
    emerald: { bg: 'suggestion-bg-emerald', icon: 'suggestion-icon-emerald', orb: 'suggestion-orb-emerald' },
    amber: { bg: 'suggestion-bg-amber', icon: 'suggestion-icon-amber', orb: 'suggestion-orb-amber' },
    rose: { bg: 'suggestion-bg-rose', icon: 'suggestion-icon-rose', orb: 'suggestion-orb-rose' },
  };
  const a = accentMap[item.accent];

  return (
    <button
      onClick={onClick}
      className={`suggestion-card ${a.bg}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`suggestion-orb ${a.orb}`} />
      <div className="suggestion-content">
        <div className={`suggestion-icon-wrap ${a.icon}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="suggestion-text">
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      </div>
      <div className="suggestion-hint">
        <CornerDownLeft size={12} />
        <span>Click to try</span>
      </div>
    </button>
  );
};

/* ─── Markdown Renderer ─── */

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  const lang = className ? className.replace('language-', '') : 'text';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={className}><code>{children}</code></pre>
    </div>
  );
};

const markdownComponents = {
  h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
  h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
  h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
  p: ({ children }) => <p className="md-p">{children}</p>,
  ul: ({ children }) => <ul className="md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="md-ol">{children}</ol>,
  li: ({ children }) => <li className="md-li">{children}</li>,
  strong: ({ children }) => <strong className="md-strong">{children}</strong>,
  em: ({ children }) => <em className="md-em">{children}</em>,
  blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
  hr: () => <hr className="md-hr" />,
  a: ({ href, children }) => <a href={href} className="md-a" target="_blank" rel="noreferrer">{children}</a>,
  code: ({ inline, children, className }) => {
    if (inline) {
      return <code className="md-code-inline">{children}</code>;
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => <div className="md-table-wrapper"><table className="md-table">{children}</table></div>,
  thead: ({ children }) => <thead className="md-thead">{children}</thead>,
  tbody: ({ children }) => <tbody className="md-tbody">{children}</tbody>,
  tr: ({ children }) => <tr className="md-tr">{children}</tr>,
  th: ({ children }) => <th className="md-th">{children}</th>,
  td: ({ children }) => <td className="md-td">{children}</td>,
};

const MarkdownContent = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
    {content}
  </ReactMarkdown>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-row ${isUser ? 'message-row-user' : 'message-row-assistant'}`}>
      <div className={`message-avatar ${isUser ? 'message-avatar-user' : 'message-avatar-assistant'}`}>
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      <div className="message-body">
        <div className="message-meta">
          <span className="message-author">{isUser ? 'You' : 'AI Assistant'}</span>
          <span className="message-time">
            <Clock size={10} />
            {timeStr}
          </span>
          {!isUser && message.status === 'read' && <CheckCheck size={12} className="message-read" />}
        </div>

        <div className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'} ${message.isError ? 'message-bubble-error' : ''}`}>
          {isUser ? (
            <p className="md-p" style={{ margin: 0 }}>{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
          {!isUser && !message.isError && <div className="message-bubble-accent" />}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="typing-row">
    <div className="message-avatar message-avatar-assistant">
      <Sparkles size={16} />
    </div>
    <div className="typing-bubble">
      <span className="typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="typing-dot" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

/* ─── Main App ─── */

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState(1);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ═══ MERN: Express API Integration ═══ */
  const handleSend = async (text = input) => {
    if (!text.trim() || isTyping) return;
    setError(null);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || data.response || data.message || 'No response from server.',
        timestamp: new Date(),
        status: 'read'
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat API error:', err);
      setError(err.message);

      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `⚠️ **Connection failed**: ${err.message}.\n\nPlease make sure your Express server is running on port 5000.`,
        timestamp: new Date(),
        status: 'read',
        isError: true
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length <= 1;

  return (
    <div className="app-shell">
      {/* ═══ Sidebar ═══ */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="sidebar-logo-title">Fritz AI</h1>
              <p className="sidebar-logo-version">v2.0 Premium</p>
            </div>
          </div>

          {/* New Chat */}
          <div className="sidebar-newchat">
            <button className="newchat-btn" onClick={() => { setMessages(INITIAL_MESSAGES); setActiveChat(1); }}>
              <Plus size={16} className="newchat-icon" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <Search size={14} />
            <input type="text" placeholder="Search conversations..." />
          </div>

          {/* History */}
          <div className="sidebar-history">
            <div className="sidebar-section-label">
              <History size={12} />
              Recent
            </div>
            {CHAT_HISTORY.map(item => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeChat === item.id}
                onClick={() => setActiveChat(item.id)}
              />
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="sidebar-footer">
            <button className="sidebar-footer-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button className="sidebar-footer-btn">
              <Settings size={16} className="sidebar-settings-icon" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ Main Chat ═══ */}
      <main className="main">
        {/* Decorative background */}
        <div className="main-bg-decor">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>

        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            {!sidebarOpen && (
              <button className="header-btn" onClick={() => setSidebarOpen(true)}>
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="header-avatar">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="header-title">AI Assistant</h2>
              <div className="header-status">
                <StatusDot status="online" />
                <span>Always online</span>
              </div>
            </div>
          </div>

          <div className="chat-header-right">
            <button className="header-btn header-btn-danger" onClick={() => setMessages(INITIAL_MESSAGES)}>
              <Trash2 size={18} />
            </button>
            <button className="header-btn">
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className={`chat-messages ${isEmpty ? 'chat-messages-empty' : ''}`}>
          {isEmpty && (
            <div className="welcome-screen">
              <div className="welcome-badge">
                <div className="welcome-badge-glow" />
                <div className="welcome-badge-inner">
                  <Sparkles size={14} />
                  <span>Fritz AI</span>
                </div>
              </div>

              <h1 className="welcome-title">
                Hi, This is Fritz AI.
                <br />
                <span>How can I help you today?</span>
              </h1>

              <p className="welcome-subtitle">
                Ask me anything — coding, writing, analysis, brainstorming, or just a chat.
                I'm powered by advanced language models to assist you.
              </p>

              <div className="suggestions-grid">
                {SUGGESTIONS.map((item, i) => (
                  <SuggestionCard
                    key={item.title}
                    item={item}
                    index={i}
                    onClick={() => handleSend(item.desc)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="messages-list">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-inner">
            {error && (
              <div className="input-error-banner">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
            <div className="input-toolbar">
              <div className="input-toolbar-chip">
                <Zap size={12} />
                <span>Pro Mode</span>
              </div>
              <div className="input-toolbar-chip">
                <Command size={12} />
                <span>Shortcuts</span>
              </div>
            </div>

            <div className="input-box">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                rows={1}
                className="input-textarea"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={`input-send ${input.trim() && !isTyping ? 'input-send-active' : ''}`}
              >
                {isTyping ? <Loader2 size={18} className="spin" /> : <Send size={16} />}
              </button>
            </div>

            <p className="input-disclaimer">
              AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}