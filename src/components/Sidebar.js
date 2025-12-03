import React from 'react';
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

  return (
    <div className="iq-sidebar sidebar-default">
      <div className="iq-sidebar-logo d-flex align-items-center justify-content-between">
        <Link to="/dashboard" className="header-logo">
          <h2 className="mb-3">SIMPLE BIM</h2>
        </Link>
        <div className="iq-menu-bt-sidebar">
          <i className="las la-bars wrapper-menu"></i>
        </div>
      </div>
      <div className="data-scrollbar" data-scroll="1">
        <nav className="iq-sidebar-menu">
          <ul id="iq-sidebar-toggle" className="iq-menu">
            <li className={isActive('/dashboard')}>
              <Link to="/dashboard" className="">
                <i className="las la-home iq-arrow-left"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/keys')}>
              <Link to="/keys" className="">
                <i className="las la-key iq-arrow-left"></i>
                <span>Key Management</span>
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
                  <h6 className="mb-0">{user?.username || 'Admin'}</h6>
                  <small>{user?.email || ''}</small>
                </div>
              </div>
              <button
                className="btn btn-light btn-block btn-sm mt-2"
                onClick={handleLogout}
              >
                <i className="las la-sign-out-alt mr-1"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;