import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Ensure wrapper element exists
    let wrapper = document.querySelector('.wrapper');
    if (!wrapper) {
      console.warn('Wrapper element not found, sidebar toggle may not work');
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

    // Setup toggle buttons
    const setupButtons = () => {
      const toggleButtons = document.querySelectorAll('.wrapper-menu');
      const overlay = document.querySelector('.sidebar-overlay');

      toggleButtons.forEach(btn => {
        btn.removeEventListener('click', toggleSidebar); // Remove old listeners
        btn.addEventListener('click', toggleSidebar);
      });

      if (overlay) {
        overlay.removeEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
      }
    };

    // Initial setup
    setupButtons();

    // Re-setup after a short delay to catch dynamically added buttons
    const timeoutId = setTimeout(setupButtons, 100);

    // Close sidebar when navigating on mobile
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

  return (
    <>
      <div className="iq-sidebar sidebar-default">
      <div className="iq-sidebar-logo d-flex align-items-center justify-content-between">
        <Link to="/B?ng �i?u khi?n" className="header-logo">
          <h2 className="mb-3">SIMPLE BIM</h2>
        </Link>
        <div className="iq-menu-bt-sidebar">
          <i className="las la-bars wrapper-menu"></i>
        </div>
      </div>
      <div className="data-scrollbar" data-scroll="1">
        <nav className="iq-sidebar-menu">
          <ul id="iq-sidebar-toggle" className="iq-menu">
            <li className={isActive('/downloads')}>
              <Link to="/downloads" className="">
                <i className="las la-download iq-arrow-left"></i>
                <span>Tải xuống</span>
              </Link>
            </li>
            <li className={isActive('/dashboard')}>
              <Link to="/dashboard" className="">
                <i className="las la-home iq-arrow-left"></i>
                <span>Bảng điều khiển</span>
              </Link>
            </li>
            <li className={isActive('/keys')}>
              <Link to="/keys" className="">
                <i className="las la-key iq-arrow-left"></i>
                <span>Quản lý key</span>
              </Link>
            </li>
            <li className={isActive('/updates')}>
              <Link to="/updates" className="">
                <i className="las la-cloud-download-alt iq-arrow-left"></i>
                <span>Quản lý cập nhật</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="sidebar-bottom p-3">
          <div className="iq-card bg-primary rounded">
            <div className="iq-card-body p-3">
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="ml-3 text-white">
                  <h6 className="mb-0">{user?.username || 'Quản trị'}</h6>
                  <small>{user?.email || ''}</small>
                </div>
              </div>
              <button
                className="btn btn-light btn-block btn-sm mt-2"
                onClick={handleLogout}
              >
                <i className="las la-sign-out-alt mr-1"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="sidebar-overlay"></div>
    </>
  );
};

export default Sidebar;
