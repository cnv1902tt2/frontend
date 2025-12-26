import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

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
    standalone: {
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
    },
  };

  // Nếu user đã đăng nhập, hiển thị sidebar
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

  // Nếu chưa đăng nhập, hiển thị standalone
  return <div style={styles.standalone}>{children}</div>;
};

export default PublicLayout;
