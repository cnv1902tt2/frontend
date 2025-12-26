import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Public Sidebar - chỉ hiển thị khi chưa đăng nhập, chỉ có option đăng nhập
const PublicSidebar = () => {
  const location = useLocation();

  useEffect(() => {
    let wrapper = document.querySelector('.wrapper');
    if (!wrapper) {
      return;
    }

    const toggleSidebar = (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrapper = document.querySelector('.wrapper');
      if (wrapper) {
        wrapper.classList.toggle('sidebar-main');
      }
    };

    const closeSidebar = (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrapper = document.querySelector('.wrapper');
      if (wrapper && wrapper.classList.contains('sidebar-main')) {
        wrapper.classList.remove('sidebar-main');
      }
    };

    const setupButtons = () => {
      const toggleButtons = document.querySelectorAll('.wrapper-menu');
      const overlay = document.querySelector('.sidebar-overlay');

      toggleButtons.forEach(btn => {
        btn.removeEventListener('click', toggleSidebar);
        btn.addEventListener('click', toggleSidebar);
      });

      if (overlay) {
        overlay.removeEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
      }
    };

    setupButtons();
    const timeoutId = setTimeout(setupButtons, 100);

    // Auto close on mobile when navigating
    const mediaQuery = window.matchMedia('(max-width: 1199px)');
    if (mediaQuery.matches) {
      closeSidebar({ preventDefault: () => {}, stopPropagation: () => {} });
    }

    return () => {
      clearTimeout(timeoutId);
      const toggleButtons = document.querySelectorAll('.wrapper-menu');
      const overlay = document.querySelector('.sidebar-overlay');
      
      toggleButtons.forEach(btn => {
        btn.removeEventListener('click', toggleSidebar);
      });
      if (overlay) {
        overlay.removeEventListener('click', closeSidebar);
      }
    };
  }, [location]);

  const styles = {
    sidebar: {
      backgroundColor: '#FFFFFF',
      width: '260px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      overflowY: 'auto',
    },
    logo: {
      padding: '20px 16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0,
    },
    menuToggle: {
      fontSize: '1.25rem',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '4px',
    },
    nav: {
      flex: 1,
      padding: '16px 0',
      overflowY: 'auto',
    },
    menuList: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    menuItem: {
      margin: '2px 8px',
    },
    menuLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      color: '#4b5563',
      textDecoration: 'none',
      borderRadius: '6px',
      fontSize: '0.9375rem',
      fontWeight: '500',
      transition: 'background-color 0.2s, color 0.2s',
    },
    menuLinkActive: {
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
    },
    menuIcon: {
      fontSize: '1.25rem',
      width: '24px',
    },
    loginSection: {
      padding: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    loginCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
    },
    loginText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '12px',
    },
    loginBtn: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#3b82f6',
      border: 'none',
      borderRadius: '6px',
      color: '#FFFFFF',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'background-color 0.2s',
      textDecoration: 'none',
    },
  };

  const isActive = (path) => location.pathname === path;

  // Menu items công khai (chỉ có tải xuống)
  const publicMenuItems = [
    { path: '/downloads', icon: 'las la-download', label: 'Tải xuống' },
  ];

  return (
    <>
      <div className="iq-sidebar sidebar-default" style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <Link to="/downloads" style={{ textDecoration: 'none' }}>
            <h2 style={styles.logoTitle}>SIMPLE BIM</h2>
          </Link>
          <i className="las la-bars wrapper-menu" style={styles.menuToggle}></i>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <ul style={styles.menuList}>
            {publicMenuItems.map((item) => (
              <li key={item.path} style={styles.menuItem}>
                <Link 
                  to={item.path}
                  style={{
                    ...styles.menuLink,
                    ...(isActive(item.path) ? styles.menuLinkActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <i className={item.icon} style={styles.menuIcon}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Login Section */}
        <div style={styles.loginSection}>
          <div style={styles.loginCard}>
            <p style={styles.loginText}>Đăng nhập để truy cập tất cả tính năng</p>
            <Link 
              to="/login"
              style={styles.loginBtn}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              <i className="las la-sign-in-alt"></i>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default PublicSidebar;
