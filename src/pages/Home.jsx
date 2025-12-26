/* Home page - Clean design với white background */
const Home = () => {
  return (
    <>
      <style>{`
        /* Hero section - solid background, no gradient */
        .hero { 
          background: #3b82f6; 
          border-radius: 8px; 
          padding: 40px; 
        }
        /* Responsive padding */
        @media (max-width: 768px) {
          .hero { padding: 24px 16px; }
        }
        .pill { 
          display: inline-block; 
          padding: 4px 10px; 
          border-radius: 4px; 
          background: rgba(255,255,255,0.2); 
          color: #FFFFFF; 
          font-weight: 600; 
          font-size: 0.875rem;
        }
      `}</style>

      {/* Hero Section - Clean solid blue */}
      <section className="hero mb-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <p className="fw-semibold" style={{color: 'rgba(255,255,255,0.9)'}}>Revit Add-in • C# • Workflow đầy đủ</p>
            <h1 className="display-5 fw-bold text-white mb-3">Hướng Dẫn Dự Án SimpleBIM</h1>
            <p className="lead" style={{color: 'rgba(255,255,255,0.85)'}}>Bộ hướng dẫn trực quan giúp bạn hiểu cấu trúc dự án, chỉnh sửa mã, build, obfuscate, phát hành và cập nhật SimpleBIM. Mọi thao tác đều có hướng dẫn chi tiết đến từng cú click.</p>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <a className="btn btn-light btn-lg" href="/admin/structure" style={{borderRadius: '6px', fontWeight: '600'}}>Xem cấu trúc dự án</a>
              <a className="btn btn-outline-light btn-lg" href="/admin/guide" style={{borderRadius: '6px'}}>Bắt đầu chỉnh sửa & phát hành</a>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card h-100" style={{borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div className="card-body">
                <h5 className="card-title" style={{fontWeight: '600', color: '#1f2937'}}>Nội dung nổi bật</h5>
                <ul className="list-unstyled mt-3 mb-0" style={{color: '#4b5563'}}>
                  <li className="mb-2">✅ Cấu trúc thư mục, vai trò từng module</li>
                  <li className="mb-2">✅ Hướng dẫn tạo command, ribbon, icon</li>
                  <li className="mb-2">✅ Build, obfuscation với ConfuserEx</li>
                  <li className="mb-2">✅ Tạo installer, release GitHub, cập nhật web</li>
                  <li className="mb-2">✅ Quy trình auto-update và kiểm tra license</li>
                  <li className="mb-2">🤖 Chatbot AI hỗ trợ 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="mb-4">
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">
            <a href="/admin/structure" style={{textDecoration: 'none'}}>
              <div className="card h-100" style={{borderRadius: '8px', border: '1px solid #e5e7eb', transition: 'transform 0.2s'}}>
                <div className="card-body">
                  <h5 className="card-title" style={{fontWeight: '600', color: '#1f2937'}}>Cấu trúc dự án</h5>
                  <p className="card-text" style={{color: '#6b7280', fontSize: '0.9375rem'}}>Giải thích chi tiết từng thư mục, file và luồng hoạt động Startup, License, Update.</p>
                </div>
              </div>
            </a>
          </div>
          <div className="col-md-6 col-lg-3">
            <a href="/admin/guide" style={{textDecoration: 'none'}}>
              <div className="card h-100" style={{borderRadius: '8px', border: '1px solid #e5e7eb', transition: 'transform 0.2s'}}>
                <div className="card-body">
                  <h5 className="card-title" style={{fontWeight: '600', color: '#1f2937'}}>Chỉnh sửa & phát hành</h5>
                  <p className="card-text" style={{color: '#6b7280', fontSize: '0.9375rem'}}>Các bước tạo chức năng, ribbon, build, obfuscate, đóng gói và phát hành.</p>
                </div>
              </div>
            </a>
          </div>
          <div className="col-md-6 col-lg-3">
            <a href="/admin/search" style={{textDecoration: 'none'}}>
              <div className="card h-100" style={{borderRadius: '8px', border: '1px solid #e5e7eb', transition: 'transform 0.2s'}}>
                <div className="card-body">
                  <h5 className="card-title" style={{fontWeight: '600', color: '#1f2937'}}>Tìm kiếm nhanh</h5>
                  <p className="card-text" style={{color: '#6b7280', fontSize: '0.9375rem'}}>Gõ từ khóa để tra cứu nhanh toàn bộ hướng dẫn.</p>
                </div>
              </div>
            </a>
          </div>
          <div className="col-md-6 col-lg-3">
            <a href="/admin/usage-guide" style={{textDecoration: 'none'}}>
              <div className="card h-100" style={{borderRadius: '8px', border: '1px solid #e5e7eb', transition: 'transform 0.2s'}}>
                <div className="card-body">
                  <h5 className="card-title" style={{fontWeight: '600', color: '#1f2937'}}>Hướng dẫn sử dụng</h5>
                  <p className="card-text" style={{color: '#6b7280', fontSize: '0.9375rem'}}>Cách sử dụng ứng dụng này và chatbot AI một cách hiệu quả nhất.</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer mt-4">
        <small style={{color: '#9ca3af'}}>SimpleBIM Documentation • React + Bootstrap 5 • Chatbot AI powered by Gemini</small>
      </footer>
    </>
  );
};

export default Home;
