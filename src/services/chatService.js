// Chat Service - API calls cho chat history và RAG
// Tương tác với backend /chat endpoints
// Author: SimpleBIM Team

import api from './api';

// ==================== Session APIs ====================

/**
 * Tạo session chat mới
 * @param {string} title - Tên session (optional)
 * @returns {Promise<Object>} Session object
 */
export const createChatSession = async (title = 'Cuộc trò chuyện mới') => {
  try {
    const response = await api.post('/chat/sessions', { title });
    return response.data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sessions của user
 * @param {number} skip - Offset để phân trang
 * @param {number} limit - Số lượng kết quả
 * @returns {Promise<Object>} { sessions: [], total: number }
 */
export const getChatSessions = async (skip = 0, limit = 20) => {
  try {
    const response = await api.get('/chat/sessions', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết session với messages
 * @param {number} sessionId - ID của session
 * @returns {Promise<Object>} Session với messages
 */
export const getChatSessionDetail = async (sessionId) => {
  try {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session detail:', error);
    throw error;
  }
};

/**
 * Cập nhật session (title, is_active)
 * @param {number} sessionId - ID của session
 * @param {Object} updateData - { title?, is_active? }
 * @returns {Promise<Object>} Updated session
 */
export const updateChatSession = async (sessionId, updateData) => {
  try {
    const response = await api.put(`/chat/sessions/${sessionId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

/**
 * Xóa session
 * @param {number} sessionId - ID của session
 * @returns {Promise<Object>} Success message
 */
export const deleteChatSession = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};


// ==================== Message APIs ====================

/**
 * Gửi message và nhận response (kiểm tra cache trước)
 * @param {string} query - Câu hỏi của user
 * @param {number|null} sessionId - ID session (null để tạo mới)
 * @returns {Promise<Object>} { session_id, message_id, response, is_from_cache, similarity_score }
 */
export const sendChatMessage = async (query, sessionId = null) => {
  try {
    const response = await api.post('/chat/send', {
      query,
      session_id: sessionId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Cập nhật response từ LLM cho message (sau khi frontend gọi Gemini)
 * @param {number} messageId - ID của message cần update
 * @param {string} responseText - Response từ LLM
 * @param {string|null} ragContext - Context đã dùng (optional)
 * @returns {Promise<Object>} Success message
 */
export const updateMessageResponse = async (messageId, responseText, ragContext = null) => {
  try {
    const response = await api.put(`/chat/messages/${messageId}/response`, null, {
      params: {
        response: responseText,
        rag_context: ragContext
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating message response:', error);
    throw error;
  }
};


// ==================== Few-shot & Cache APIs ====================

/**
 * Lấy few-shot examples từ cache
 * @param {number} count - Số lượng examples
 * @returns {Promise<Array>} Array of { question, answer }
 */
export const getFewShotExamples = async (count = 5) => {
  try {
    const response = await api.get('/chat/few-shot-examples', {
      params: { count }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching few-shot examples:', error);
    // Return default examples if API fails
    return getDefaultFewShotExamples();
  }
};

/**
 * Default few-shot examples khi chưa có cache
 */
export const getDefaultFewShotExamples = () => [
  {
    question: "làm thế nào để đăng nhập vào hệ thống",
    answer: "Truy cập /login, nhập username/password, hệ thống sử dụng AuthProvider để xử lý JWT token. Token được lưu trong localStorage và tự động gửi kèm mọi request."
  },
  {
    question: "quản lý key ở đâu",
    answer: "Trang /admin/keys sử dụng KeyManagement component. Bạn có thể xem danh sách keys, tạo key mới, kích hoạt/vô hiệu hóa, và xem thông tin máy đã sử dụng key."
  },
  {
    question: "cách cập nhật phiên bản",
    answer: "Sử dụng UpdateManagement tại /admin/updates. Tạo version mới với download URL, SHA256 checksum, release notes. Add-in sẽ tự động kiểm tra và tải bản mới."
  },
  {
    question: "hướng dẫn sử dụng search",
    answer: "Trang /admin/search hỗ trợ tìm kiếm full-text trong tài liệu. Gõ từ khóa, hệ thống sẽ highlight kết quả. Click vào kết quả để đi đến section tương ứng."
  },
  {
    question: "pwa hoạt động như thế nào",
    answer: "Manifest.json định nghĩa app icon và tên. Service-worker.js cache các assets để app hoạt động offline. Token được giữ trong localStorage để maintain login state."
  }
];

/**
 * Lấy thống kê chat
 * @returns {Promise<Object>} Statistics object
 */
export const getChatStatistics = async () => {
  try {
    const response = await api.get('/chat/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    throw error;
  }
};


// ==================== Export all ====================

const chatService = {
  createChatSession,
  getChatSessions,
  getChatSessionDetail,
  updateChatSession,
  deleteChatSession,
  sendChatMessage,
  updateMessageResponse,
  getFewShotExamples,
  getDefaultFewShotExamples,
  getChatStatistics
};

export default chatService;
