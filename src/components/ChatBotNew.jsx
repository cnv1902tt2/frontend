// ChatBot Component - Trợ lý AI với session management và RAG
// Features: Lưu lịch sử, kiểm tra cache, few-shot prompting
// Author: SimpleBIM Team
// Last updated: 2025-12-26

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import chatService from '../services/chatService';
import ragService from '../services/ragService';

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


  // ==================== Initialize ====================
  
  useEffect(() => {
    // Load RAG dataset
    const initRAG = async () => {
      await ragService.loadRagDataset();
      console.log('[ChatBot] RAG initialized');
    };
    initRAG();
  }, []);
  
  
  // Load sessions khi mở sidebar
  const loadSessions = useCallback(async () => {
    try {
      const data = await chatService.getChatSessions(0, 50);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      // Không có sessions hoặc chưa login - không sao
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
    // Tạo session mới
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
      // Có thể session không còn tồn tại
      alert('Không thể mở session này');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;
    
    try {
      await chatService.deleteChatSession(sessionId);
      // Refresh list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      // Nếu đang xem session này, clear
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
    
    try {
      // 1. Gửi request đến backend - kiểm tra cache
      const sessionId = currentSession?.id || null;
      const chatResponse = await chatService.sendChatMessage(userQuery, sessionId);
      
      // Update session nếu là session mới
      if (!currentSession && chatResponse.session_id) {
        setCurrentSession({ id: chatResponse.session_id });
      }
      
      let finalResponse = '';
      let isFromCache = chatResponse.is_from_cache;
      
      // 2. Kiểm tra xem có cần gọi LLM không
      if (chatResponse.response === '__NEEDS_LLM__') {
        // Cache miss - cần gọi LLM
        finalResponse = await callLLMWithRAG(userQuery);
        isFromCache = false;
        
        // 3. Cập nhật response vào database
        try {
          await chatService.updateMessageResponse(chatResponse.message_id, finalResponse);
        } catch (updateErr) {
          console.error('Failed to save response to DB:', updateErr);
          // Vẫn hiển thị response cho user
        }
      } else {
        // Cache hit - dùng response từ database
        finalResponse = chatResponse.response;
        console.log(`[Cache Hit] Similarity: ${chatResponse.similarity_score}`);
      }
      
      // 4. Thêm response vào messages
      const assistantMsg = {
        role: 'assistant',
        content: finalResponse,
        id: chatResponse.message_id,
        is_from_cache: isFromCache,
        similarity_score: chatResponse.similarity_score
      };
      setMessages(prev => [...prev, assistantMsg]);
      
      // 5. Refresh sessions list
      loadSessions();
      
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback: gọi LLM trực tiếp nếu API lỗi
      try {
        const fallbackResponse = await callLLMWithRAG(userQuery);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fallbackResponse,
          id: Date.now()
        }]);
      } catch (llmError) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Xin lỗi, đã có lỗi xảy ra: ${llmError.message}. Vui lòng thử lại sau.`,
          id: Date.now()
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };


  // ==================== LLM + RAG ====================
  
  const callLLMWithRAG = async (query) => {
    // 1. Run RAG pipeline - retrieve chunks và build context
    const { context, fewShotPrompt, sources } = await ragService.runRagPipeline(query, messages);
    
    // 2. Build full prompt
    const prompt = ragService.buildLLMPrompt(query, context, fewShotPrompt);
    
    // 3. Call Gemini API
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chưa cấu hình REACT_APP_GEMINI_API_KEY');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('[RAG] Sources used:', sources);
    return response.text();
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
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        
        .chatbot-header {
          background: #3b82f6;
          color: white;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 0.9375rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbot-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chatbot-header-actions {
          display: flex;
          gap: 6px;
        }
        .chatbot-header-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.2s;
        }
        .chatbot-header-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .chatbot-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        /* Sidebar */
        .chatbot-sidebar {
          width: 200px;
          background: #f9fafb;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .chatbot-sidebar-header {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .chatbot-new-btn {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .chatbot-new-btn:hover {
          background: #2563eb;
        }
        .chatbot-sessions {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .chatbot-session-item {
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .chatbot-session-item:hover {
          background: #f3f4f6;
          border-color: #3b82f6;
        }
        .chatbot-session-item.active {
          background: #eff6ff;
          border-color: #3b82f6;
        }
        .chatbot-session-title {
          font-size: 0.8125rem;
          color: #374151;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        .chatbot-session-delete {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 2px 6px;
          font-size: 14px;
        }
        .chatbot-session-delete:hover {
          color: #ef4444;
        }
        
        /* Messages */
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fafafa;
        }
        .message {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          word-wrap: break-word;
          font-size: 0.9375rem;
          line-height: 1.6;
        }
        .message-user {
          align-self: flex-end;
          background: #3b82f6;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message-assistant {
          align-self: flex-start;
          background: #FFFFFF;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }
        .message-cache-badge {
          font-size: 0.6875rem;
          color: #10b981;
          margin-top: 4px;
          display: block;
        }
        
        /* Input */
        .chatbot-input-area {
          padding: 12px 16px;
          background: #FFFFFF;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }
        .chatbot-input {
          flex: 1;
          background: #f9fafb;
          border: 1px solid #d1d5db;
          color: #374151;
          border-radius: 8px;
          padding: 10px 12px;
          resize: none;
          font-size: 0.9375rem;
          font-family: inherit;
        }
        .chatbot-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .chatbot-send {
          background: #3b82f6;
          border: none;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9375rem;
          transition: background 0.2s;
        }
        .chatbot-send:hover {
          background: #2563eb;
        }
        .chatbot-send:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }
        
        /* Loading */
        .loading-dots {
          display: flex;
          gap: 4px;
          padding: 8px;
        }
        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .chatbot-window {
            width: calc(100vw - 32px);
            height: calc(100vh - 110px);
            bottom: 78px;
            right: 16px;
          }
          .chatbot-container {
            bottom: 16px;
            right: 16px;
          }
          .chatbot-sidebar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 10;
            width: 80%;
            max-width: 260px;
            box-shadow: 4px 0 12px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <div className="chatbot-container">
        {/* Toggle Button */}
        {!isOpen && (
          <button className="chatbot-toggle" onClick={() => setIsOpen(true)} title="Mở trợ lý AI">
            💬
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="chatbot-window">
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-left">
                <button className="chatbot-header-btn" onClick={toggleSidebar} title="Danh sách hội thoại">
                  ☰
                </button>
                <span>🤖 SimpleBIM AI</span>
              </div>
              <div className="chatbot-header-actions">
                <button className="chatbot-header-btn" onClick={handleNewSession} title="Cuộc trò chuyện mới">
                  ✚
                </button>
                <button className="chatbot-header-btn" onClick={() => setIsOpen(false)} title="Đóng">
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="chatbot-body">
              {/* Sidebar - Session List */}
              {showSidebar && (
                <div className="chatbot-sidebar">
                  <div className="chatbot-sidebar-header">
                    <button className="chatbot-new-btn" onClick={handleNewSession}>
                      + Trò chuyện mới
                    </button>
                  </div>
                  <div className="chatbot-sessions">
                    {sessions.length === 0 ? (
                      <p style={{color: '#9ca3af', fontSize: '0.8125rem', textAlign: 'center', padding: '20px 0'}}>
                        Chưa có hội thoại nào
                      </p>
                    ) : (
                      sessions.map(session => (
                        <div 
                          key={session.id}
                          className={`chatbot-session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                          onClick={() => handleSelectSession(session)}
                        >
                          <span className="chatbot-session-title">{session.title}</span>
                          <button 
                            className="chatbot-session-delete"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            title="Xóa"
                          >
                            🗑
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="chatbot-messages">
                {messages.length === 0 && (
                  <div className="message message-assistant">
                    Xin chào! Tôi là trợ lý AI của SimpleBIM. Hãy hỏi tôi về:
                    <ul style={{margin: '8px 0 0 0', paddingLeft: '20px'}}>
                      <li>Cấu trúc dự án và các folder</li>
                      <li>Cách tạo command, ribbon, icon</li>
                      <li>Quy trình build, obfuscate, release</li>
                      <li>Hệ thống license và update</li>
                    </ul>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                  >
                    {msg.content}
                    {msg.is_from_cache && (
                      <span className="message-cache-badge">
                        ⚡ Từ cache ({Math.round((msg.similarity_score || 0) * 100)}% match)
                      </span>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="message message-assistant">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="chatbot-input-area">
              <textarea
                ref={inputRef}
                className="chatbot-input"
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
                disabled={isLoading}
              />
              <button
                className="chatbot-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBot;
