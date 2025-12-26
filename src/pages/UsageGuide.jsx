import { Link } from 'react-router-dom';

/* UsageGuide page - Hướng dẫn sử dụng ứng dụng */
const UsageGuide = () => {
  return (
    <>
      {/* Clean white background styles */}
      <style>{`
        .feature-box { 
          background: #FFFFFF; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 16px; 
          border: 1px solid #e5e7eb; 
        }
        .feature-title { 
          color: #3b82f6; 
          font-weight: 600; 
          margin-bottom: 12px; 
          font-size: 1.1rem;
        }
        .tip { 
          background: #eff6ff; 
          border-left: 4px solid #3b82f6; 
          padding: 12px; 
          margin: 12px 0; 
          border-radius: 4px; 
          color: #1e40af;
        }
        .feature-box code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          color: #ef4444;
          font-size: 0.875rem;
        }
        .feature-box strong {
          color: #1f2937;
        }
        .feature-box ul, .feature-box ol {
          color: #4b5563;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0" style={{color: '#1f2937', fontWeight: '700'}}>Hướng dẫn sử dụng ứng dụng</h1>
        <Link className="btn btn-outline-secondary" to="/admin/dashboard" style={{borderRadius: '6px'}}>← Quay về trang chủ</Link>
      </div>

      <p style={{color: '#6b7280', marginBottom: '24px'}}>Chào mừng bạn đến với SimpleBIM Documentation! Đây là hướng dẫn sử dụng ứng dụng web này để tra cứu tài liệu và sử dụng chatbot AI một cách hiệu quả.</p>

      <div className="feature-box">
        <div className="feature-title">📚 Cấu trúc ứng dụng</div>
        <p style={{color: '#6b7280', marginBottom: '8px'}}>Ứng dụng gồm 5 trang chính:</p>
        <ul>
                 <Link className="btn btn-outline-secondary" to="/dashboard" style={{borderRadius: '6px'}}>← Quay về trang chủ</Link>
          <li><strong>Cấu trúc dự án</strong> - Chi tiết về thư mục, file, luồng hoạt động</li>
          <li><strong>Chỉnh sửa & phát hành</strong> - Hướng dẫn từng bước build, obfuscate, release</li>
          <li><strong>Tìm kiếm</strong> - Tìm kiếm full-text qua toàn bộ tài liệu</li>
          <li><strong>Hướng dẫn sử dụng</strong> - Trang này</li>
        </ul>
      </div>

      <div className="feature-box">
        <div className="feature-title">🔍 Cách sử dụng tìm kiếm</div>
        <ol>
          <li>Vào trang <Link to="/admin/search" style={{color: '#3b82f6'}}>Tìm kiếm</Link></li>
          <li>Nhập từ khóa vào ô tìm kiếm (ví dụ: "ConfuserEx", "Ribbon", "UpdateService")</li>
          <li>Kết quả sẽ hiện ngay lập tức với đoạn văn bản có chứa từ khóa được highlight</li>
          <li>Click vào tiêu đề kết quả để đến trang chi tiết</li>
        </ol>
        <div className="tip">
          <strong>💡 Mẹo:</strong> Tìm kiếm hỗ trợ fuzzy matching - bạn có thể gõ sai chính tả một chút vẫn tìm được kết quả!
        </div>
      </div>
                   <li>Vào trang <Link to="/search" style={{color: '#3b82f6'}}>Tìm kiếm</Link></li>
      <div className="feature-box">
        <div className="feature-title">🤖 Cách sử dụng Chatbot AI</div>
        <p style={{color: '#6b7280', marginBottom: '8px'}}>Chatbot được tích hợp Gemini AI và RAG (Retrieval-Augmented Generation) để trả lời câu hỏi chính xác dựa trên tài liệu dự án.</p>
        
        <p className="mt-3" style={{color: '#1f2937'}}><strong>Bước 1: Mở chatbot</strong></p>
        <ul>
          <li>Tìm biểu tượng 💬 ở góc dưới bên phải màn hình</li>
          <li>Click vào biểu tượng để mở cửa sổ chat</li>
        </ul>

        <p className="mt-3" style={{color: '#1f2937'}}><strong>Bước 2: Đặt câu hỏi</strong></p>
        <ul>
          <li>Nhập câu hỏi vào ô input</li>
          <li>Nhấn Enter hoặc nút "Gửi"</li>
          <li>Chatbot sẽ tự động tìm thông tin liên quan trong tài liệu và trả lời</li>
        </ul>

        <div className="tip">
          <strong>💡 Câu hỏi mẫu hiệu quả:</strong>
          <ul className="mb-0 mt-2">
            <li>"Cách tạo ribbon mới trong SimpleBIM?"</li>
            <li>"UpdateService hoạt động như thế nào?"</li>
            <li>"Quy trình build và obfuscate là gì?"</li>
            <li>"LicenseManager sử dụng thuật toán mã hóa nào?"</li>
            <li>"Cách thêm command mới vào tab MEPF?"</li>
          </ul>
        </div>

        <p className="mt-3" style={{color: '#1f2937'}}><strong>Bước 3: Đóng chatbot</strong></p>
        <ul>
          <li>Click nút × ở góc trên bên phải cửa sổ chat</li>
          <li>Lịch sử chat sẽ được giữ nguyên cho đến khi bạn reload trang</li>
        </ul>
      </div>

      <div className="feature-box">
        <div className="feature-title">⚙️ Cấu hình Gemini API Key</div>
        <p style={{color: '#6b7280', marginBottom: '8px'}}>Để chatbot hoạt động, cần cấu hình API key:</p>
        <ol>
          <li>Tạo file <code>.env</code> trong thư mục <code>frontend/</code></li>
          <li>Thêm dòng: <code>VITE_GEMINI_API_KEY=your_api_key_here</code></li>
          <li>Lấy API key miễn phí tại: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6'}}>Google AI Studio</a></li>
          <li>Restart dev server (npm run dev)</li>
        </ol>
        <div className="tip">
          <strong>⚠️ Lưu ý:</strong> Không commit file .env lên Git! File này đã được thêm vào .gitignore.
        </div>
      </div>

      <div className="feature-box">
        <div className="feature-title">🎯 Tips sử dụng hiệu quả</div>
        <ul>
          <li><strong>Dùng Accordion:</strong> Ở trang Cấu trúc và Hướng dẫn, click vào từng phần để mở/đóng nội dung, giúp tập trung vào phần cần đọc</li>
          <li><strong>Kết hợp tìm kiếm + chatbot:</strong> Tìm kiếm để có overview nhanh, chatbot để hỏi chi tiết</li>
          <li><strong>Hỏi cụ thể:</strong> Chatbot hiểu tốt câu hỏi cụ thể hơn câu hỏi chung chung</li>
          <li><strong>Responsive:</strong> App hoạt động tốt trên mobile, tablet, desktop</li>
          <li><strong>Clean design:</strong> Giao diện sáng, dễ đọc và thân thiện với mắt</li>
        </ul>
      </div>

      <div className="feature-box">
        <div className="feature-title">📱 Sử dụng trên mobile</div>
        <ul>
          <li>Menu navigation tự động thu gọn thành hamburger menu</li>
          <li>Chatbot window tự động full-screen trên màn hình nhỏ</li>
          <li>Tất cả tính năng đều hoạt động bình thường</li>
        </ul>
      </div>

      <div className="feature-box">
        <div className="feature-title">🚀 Tính năng nâng cao</div>
        <ul className="mb-0">
          <li><strong>PWA Ready:</strong> Có thể cài đặt như app native (nếu được deploy lên HTTPS)</li>
          <li><strong>Fast Navigation:</strong> React Router SPA - chuyển trang không reload</li>
          <li><strong>Smart Search:</strong> Fuse.js fuzzy search với threshold 0.3</li>
          <li><strong>Context-aware AI:</strong> Chatbot tìm top 5 snippets liên quan trước khi trả lời</li>
        </ul>
      </div>

      {/* Alert hỗ trợ */}
      <div className="alert mt-4" style={{background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '8px', padding: '16px'}}>
        <strong>💬 Cần hỗ trợ?</strong><br/>
        Nếu có bất kỳ thắc mắc nào, hãy thử hỏi chatbot AI! Chatbot được train trên toàn bộ tài liệu dự án và có thể giải đáp hầu hết câu hỏi về SimpleBIM.
      </div>
    </>
  );
};

export default UsageGuide;
