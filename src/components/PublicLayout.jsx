import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import PublicSidebar from './PublicSidebar';

// Refactor: Clean public layout, mobile-first
const PublicLayout = ({ children }) => {
  const { user } = useAuth();

  const styles = {
    wrapper: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
    },
    contentPage: {
      flex: 1,
      minWidth: 0,
    },
  };

  // Nếu user đã đăng nhập, hiển thị sidebar đầy đủ
  if (user) {
    return (
      <div className="wrapper" style={styles.wrapper}>
        <Sidebar />
        <div className="content-page" style={styles.contentPage}>
          {children}
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị PublicSidebar với toggle trên mobile
  return (
    <div className="wrapper" style={styles.wrapper}>
      <PublicSidebar />
      {/* Nút toggle hiển thị trên mobile */}
      <button 
        className="wrapper-menu public-mobile-toggle d-xl-none" 
        aria-label="Toggle menu"
      >
        <i className="las la-bars"></i>
      </button>
      <div className="content-page" style={styles.contentPage}>
        {children}
      </div>
    </div>
  );
};

export default PublicLayout;
