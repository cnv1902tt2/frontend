import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cauTrucDuAn from '../data/cautrucduan.md?raw';
import huongDanChinhSua from '../data/huondanchinhsuacode.md?raw';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fuse, setFuse] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const documents = [
      {
        id: 'cautrucduan',
        title: 'Cấu trúc dự án SimpleBIM',
        content: cauTrucDuAn
      },
      {
        id: 'huongdan',
        title: 'Hướng dẫn chỉnh sửa mã nguồn SimpleBIM',
        content: huongDanChinhSua
      }
    ];

    const fuseInstance = new Fuse(documents, {
      keys: ['title', 'content'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 3
    });

    setFuse(fuseInstance);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !fuse) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const results = fuse.search(input).slice(0, 5);
      
      let context = '';
      if (results.length > 0) {
        context = results.map(r => {
          const snippet = r.item.content.substring(0, 500);
          return `**${r.item.title}**:\n${snippet}...`;
        }).join('\n\n');
      }

      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Vui lòng cấu hình REACT_APP_GEMINI_API_KEY trong file .env');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Bạn là trợ lý AI chuyên về dự án SimpleBIM - một Revit Add-in. Dưới đây là thông tin liên quan từ tài liệu:

${context}

Câu hỏi của người dùng: ${input}

Hãy trả lời câu hỏi dựa trên thông tin trên. Nếu không tìm thấy thông tin liên quan, hãy nói rõ và đưa ra gợi ý hữu ích. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage = { role: 'assistant', content: text };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}. Vui lòng kiểm tra API key hoặc thử lại sau.` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Clean white background styles for ChatBot */}
      <style>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
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
        }
        .chatbot-toggle:hover {
          transform: scale(1.05);
          background: #2563eb;
        }
        .chatbot-window {
          position: fixed;
          bottom: 86px;
          right: 20px;
          width: 380px;
          height: 560px;
          background: #FFFFFF;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chatbot-header {
          background: #3b82f6;
          color: white;
          padding: 14px 16px;
          font-weight: 600;
          font-size: 0.9375rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 22px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          opacity: 0.9;
        }
        .chatbot-close:hover {
          opacity: 1;
        }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f9fafb;
        }
        .message {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 8px;
          word-wrap: break-word;
          font-size: 0.9375rem;
          line-height: 1.5;
        }
        .message-user {
          align-self: flex-end;
          background: #3b82f6;
          color: white;
        }
        .message-assistant {
          align-self: flex-start;
          background: #FFFFFF;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        .chatbot-input-area {
          padding: 14px;
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
          border-radius: 6px;
          padding: 10px;
          resize: none;
          font-size: 0.9375rem;
        }
        .chatbot-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .chatbot-input::placeholder {
          color: #9ca3af;
        }
        .chatbot-send {
          background: #3b82f6;
          border: none;
          color: white;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9375rem;
          transition: background-color 0.2s;
        }
        .chatbot-send:hover {
          background: #2563eb;
        }
        .chatbot-send:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }
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
        }
      `}</style>

      <div className="chatbot-container">
        {!isOpen && (
          <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
            💬
          </button>
        )}

        {isOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <span>🤖 SimpleBIM AI Assistant</span>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.length === 0 && (
                <div className="message message-assistant">
                  Xin chào! Tôi là trợ lý AI của SimpleBIM. Hãy hỏi tôi bất kỳ câu hỏi nào về cấu trúc dự án, cách chỉnh sửa code, hoặc quy trình phát hành.
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  {msg.content}
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

            <div className="chatbot-input-area">
              <textarea
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
