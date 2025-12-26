// ChatBot Component - Trợ lý AI với session management
// Features: Lưu lịch sử, kiểm tra cache, RAG + LLM ở backend
// Author: SimpleBIM Team
// Last updated: 2025-12-26

import { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../services/chatService';

const ChatBot = () => {
  // ==================== State Management ====================
  
  // UI States
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  
  // Session States
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);


  // ==================== Load Sessions ====================
  
  const loadSessions = useCallback(async () => {
    try {
      const data = await chatService.getChatSessions(0, 50);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setSessions([]);
    }
  }, []);
  
  
  useEffect(() => {
    if (isOpen && showSidebar) {
      loadSessions();
    }
  }, [isOpen, showSidebar, loadSessions]);


  // ==================== Scroll & Focus ====================
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);


  // ==================== Session Handlers ====================
  
  const handleNewSession = async () => {
    setCurrentSession(null);
    setMessages([]);
    setShowSidebar(false);
    inputRef.current?.focus();
  };
  
  const handleSelectSession = async (session) => {
    try {
      setIsLoading(true);
      const detail = await chatService.getChatSessionDetail(session.id);
      setCurrentSession(detail);
      setMessages(detail.messages || []);
      setShowSidebar(false);
    } catch (err) {
      console.error('Failed to load session:', err);
      alert('Không thể mở session này');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    
    try {
      await chatService.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Không thể xóa session');
    }
  };


  // ==================== Chat Handler ====================
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userQuery = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Thêm message user vào UI ngay lập tức
    const tempUserMsg = { role: 'user', content: userQuery, id: Date.now() };
    setMessages(prev => [...prev, tempUserMsg]);
    
    // Tạo placeholder cho assistant message
    const assistantMsgId = Date.now() + 1;
    const loadingMsg = { role: 'assistant', content: 'Đang xử lý...', id: assistantMsgId, isLoading: true };
    setMessages(prev => [...prev, loadingMsg]);
    
    try {
      // Gửi request đến backend - backend sẽ xử lý RAG + LLM
      const sessionId = currentSession?.id || null;
      const chatResponse = await chatService.sendChatMessage(userQuery, sessionId);
      
      // Update session nếu là session mới
      if (!currentSession && chatResponse.session_id) {
        setCurrentSession({ id: chatResponse.session_id });
      }
      
      // Finalize assistant message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { 
              ...msg, 
              content: chatResponse.response,
              id: chatResponse.message_id || assistantMsgId,
              is_from_cache: chatResponse.is_from_cache,
              similarity_score: chatResponse.similarity_score,
              sources: chatResponse.sources || [],
              isLoading: false
            } 
          : msg
      ));
      
      // Log cache info
      if (chatResponse.is_from_cache) {
        console.log(`[Cache Hit] Similarity: ${chatResponse.similarity_score}`);
      } else {
        console.log('[Cache Miss] Response from LLM');
      }
      
      // Refresh sessions list
      loadSessions();
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}. Vui lòng thử lại sau.`, isLoading: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };


  // ==================== Event Handlers ====================
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };


  // ==================== Render ====================
  
  return (
    <>
      {/* Styles */}
      <style>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1050;
        }
        
        .chatbot-toggle {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          background: #3b82f6;
          border: none;
          color: white;
          font-size: 22px;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .chatbot-toggle:hover {
          transform: scale(1.05);
          background: #2563eb;
        }
        
        .chatbot-window {
          position: fixed;
          bottom: 86px;
          right: 20px;
          width: 420px;
          height: 600px;
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          animation: slideUp 0.2s ease-out;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .chatbot-header {
          background: #3b82f6;
          color: white;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        
        .chatbot-header-title {
          flex: 1;
          font-weight: 600;
          font-size: 15px;
        }
        
        .chatbot-header-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .chatbot-header-btn:hover {
          background: rgba(255,255,255,0.25);
        }
        
        .chatbot-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        
        .chatbot-sidebar {
          width: 200px;
          background: #f8fafc;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .sidebar-header {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: center;
        }
        
        .new-chat-btn {
          width: 100%;
          padding: 8px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .new-chat-btn:hover {
          background: #2563eb;
        }
        
        .session-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .session-item {
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          transition: all 0.15s;
        }
        .session-item:hover {
          border-color: #3b82f6;
        }
        .session-item.active {
          background: #eff6ff;
          border-color: #3b82f6;
        }
        
        .session-title {
          flex: 1;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #374151;
        }
        
        .session-delete {
          opacity: 0;
          color: #dc2626;
          padding: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .session-item:hover .session-delete {
          opacity: 1;
        }
        
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .message.user {
          background: #3b82f6;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .message.assistant {
          background: white;
          color: #1f2937;
          align-self: flex-start;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }
        
        .message-loading {
          color: #6b7280;
          font-style: italic;
        }
        
        .cache-badge {
          font-size: 10px;
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }
        
        .sources-list {
          font-size: 11px;
          color: #6b7280;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #e5e7eb;
        }
        
        .chatbot-input-area {
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
          background: white;
        }
        
        .chatbot-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          resize: none;
          height: 42px;
          font-family: inherit;
        }
        .chatbot-input:focus {
          border-color: #3b82f6;
        }
        
        .chatbot-send {
          width: 42px;
          height: 42px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .chatbot-send:hover {
          background: #2563eb;
        }
        .chatbot-send:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .welcome-message {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }
        .welcome-message h3 {
          color: #374151;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .welcome-message p {
          font-size: 13px;
        }

        /* Backdrop overlay - click để đóng chatbot */
        .chatbot-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1049;
        }

        /* Nút đóng X trên header - luôn hiển thị */
        .chatbot-close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .chatbot-close-btn:hover {
          background: rgba(255,255,255,0.35);
        }

        @media (max-width: 480px) {
          .chatbot-container {
            bottom: 15px;
            right: 15px;
          }
          .chatbot-toggle {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
          .chatbot-window {
            width: calc(100vw - 20px);
            right: 10px;
            left: 10px;
            bottom: 75px;
            height: calc(100vh - 140px);
            max-height: calc(100vh - 140px);
          }
          .chatbot-header {
            padding: 12px;
            gap: 8px;
          }
          .chatbot-header-title {
            font-size: 14px;
          }
          .chatbot-sidebar {
            width: 140px;
          }
          .chatbot-messages {
            padding: 12px;
          }
          .message {
            max-width: 90%;
            font-size: 13px;
            padding: 8px 12px;
          }
          .chatbot-input-area {
            padding: 10px;
          }
          .chatbot-input {
            font-size: 14px;
            padding: 8px 12px;
            height: 38px;
          }
          .chatbot-send {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
      
      {/* Backdrop - Click để đóng chatbot */}
      {isOpen && (
        <div 
          className="chatbot-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="chatbot-container">
        {/* Toggle Button */}
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title="Chat với SimpleBIM Assistant"
        >
          {isOpen ? '✕' : '💬'}
        </button>
        
        {/* Chat Window */}
        {isOpen && (
          <div className="chatbot-window">
            {/* Header */}
            <div className="chatbot-header">
              <button 
                className="chatbot-header-btn"
                onClick={toggleSidebar}
                title="Lịch sử chat"
              >
                ☰
              </button>
              <span className="chatbot-header-title">
                SimpleBIM Assistant
              </span>
              <button 
                className="chatbot-header-btn"
                onClick={handleNewSession}
                title="Chat mới"
              >
                +
              </button>
              <button 
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="chatbot-body">
              {/* Sidebar */}
              {showSidebar && (
                <div className="chatbot-sidebar">
                  <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={handleNewSession}>
                      + Cuộc trò chuyện mới
                    </button>
                  </div>
                  <div className="session-list">
                    {sessions.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', padding: '20px' }}>
                        Chưa có lịch sử chat
                      </p>
                    ) : (
                      sessions.map(session => (
                        <div 
                          key={session.id}
                          className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                          onClick={() => handleSelectSession(session)}
                        >
                          <span className="session-title">{session.title}</span>
                          <span 
                            className="session-delete"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                          >
                            🗑️
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Messages */}
              <div className="chatbot-messages">
                {messages.length === 0 ? (
                  <div className="welcome-message">
                    <h3>👋 Xin chào!</h3>
                    <p>Tôi là trợ lý AI hỗ trợ phát triển SimpleBIM.</p>
                    <p>Hãy hỏi tôi về Visual Studio, C#, Revit API, build, release...</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`message ${msg.role}`}>
                      {msg.isLoading ? (
                        <span className="message-loading">{msg.content}</span>
                      ) : (
                        <>
                          <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                          {msg.is_from_cache && (
                            <span className="cache-badge">Cache</span>
                          )}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="sources-list">
                              📚 Nguồn: {msg.sources.join(', ')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input Area */}
            <div className="chatbot-input-area">
              <textarea
                ref={inputRef}
                className="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
              />
              <button 
                className="chatbot-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};


// ==================== Helper Functions ====================

/**
 * Format message content với markdown đơn giản
 */
const formatMessage = (content) => {
  if (!content) return '';
  
  return content
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:2px 4px;border-radius:3px;font-size:12px;">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br/>');
};

export default ChatBot;
