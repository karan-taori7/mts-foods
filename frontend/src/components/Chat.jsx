import { useEffect, useRef } from "react";
import logo from "../assets/Mt's logo.jpeg";

export default function Chat({ isOpen, onOpen, onClose, messages, chatInput, setChatInput, chatLoading, onSend }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [isOpen, messages]);

  return (
    <>
      {isOpen && <div className="chat-backdrop" onClick={onClose} />}

      <div className={`chat-panel${isOpen ? " open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <img src={logo} alt="" />
            <div>
              <strong>MT's Assistant</strong>
              <span>Powered by Claude AI</span>
            </div>
          </div>
          <button className="chat-close" onClick={onClose} aria-label="Close chat">✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>{msg.content}</div>
          ))}
          {chatLoading && (
            <div className="chat-bubble assistant chat-typing">
              <span /><span /><span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            ref={inputRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Ask about our products…"
          />
          <button
            className="chat-send-btn"
            onClick={onSend}
            disabled={chatLoading || !chatInput.trim()}
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {!isOpen && (
        <button className="chat-fab" onClick={onOpen} aria-label="Open chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Ask AI</span>
        </button>
      )}
    </>
  );
}
