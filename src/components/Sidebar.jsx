import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Refactor: Clean design, mobile-first, no shadows/gradients
const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    // Clear all caches and logout
    await logout(true);
  };

  useEffect(() => {
    let wrapper = document.querySelector('.wrapper');
    if (!wrapper) {
      console.warn('Wrapper element not found');
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

  // Clean styles without gradients/shadows
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
    userSection: {
      padding: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    userCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '1rem',
    },
    userName: {
      fontSize: '0.9375rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
    },
    userEmail: {
      fontSize: '0.8125rem',
      color: '#6b7280',
      margin: 0,
    },
    logoutBtn: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      color: '#4b5563',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'background-color 0.2s',
    },
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'las la-home', label: 'Bảng điều khiển', section: 'admin' },
    { path: '/downloads', icon: 'las la-download', label: 'Tải xuống', section: 'public' },
    { path: '/admin/keys', icon: 'las la-key', label: 'Quản lý key', section: 'admin' },
    { path: '/admin/updates', icon: 'las la-cloud-download-alt', label: 'Quản lý cập nhật', section: 'admin' },
    { path: '/admin/structure', icon: 'las la-sitemap', label: 'Cấu trúc dự án', section: 'docs' },
    { path: '/admin/guide', icon: 'las la-book', label: 'Chỉnh sửa & phát hành', section: 'docs' },
    { path: '/admin/search', icon: 'las la-search', label: 'Tìm kiếm', section: 'docs' },
    { path: '/admin/prompt-generator', icon: 'las la-magic', label: 'Tạo prompt', section: 'docs' },
    { path: '/admin/usage-guide', icon: 'las la-question-circle', label: 'Hướng dẫn sử dụng', section: 'docs' },
  ];

  return (
    <>
      <div className="iq-sidebar sidebar-default" style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <h2 style={styles.logoTitle}>SIMPLE BIM</h2>
          </Link>
          <i className="las la-bars wrapper-menu" style={styles.menuToggle}></i>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <ul style={styles.menuList}>
            {menuItems.map((item) => (
              <li key={item.path} style={styles.menuItem} className={isActive(item.path)}>
                <Link 
                  to={item.path}
                  style={{
                    ...styles.menuLink,
                    ...(location.pathname === item.path ? styles.menuLinkActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
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

        {/* User Section */}
        <div style={styles.userSection}>
          <div style={styles.userCard}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p style={styles.userName}>{user?.username || 'Quản trị'}</p>
                <p style={styles.userEmail}>{user?.email || ''}</p>
              </div>
            </div>
            <button
              style={styles.logoutBtn}
              onClick={handleLogout}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              aria-label="Đăng xuất"
            >
              <i className="las la-sign-out-alt"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Sidebar;
