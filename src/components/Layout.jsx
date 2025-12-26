import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import ChatBot from './ChatBotNew';  // Updated: sử dụng ChatBotNew với session management
import Sidebar from './Sidebar';

// Refactor: Clean layout wrapper, mobile-first with sticky navbar
const DocsLayout = () => {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: #FFFFFF;
        }
        .layout-content-page {
          flex: 1;
          min-width: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
        }
        .layout-content-page-no-sidebar {
          margin-left: 0;
        }
        .layout-navbar-wrapper {
          position: fixed;
          top: 0;
          left: 260px;
          right: 0;
          z-index: 100;
          background-color: #FFFFFF;
          border-bottom: 1px solid #e5e7eb;
        }
        .layout-navbar-wrapper-no-sidebar {
          left: 0;
        }
        .layout-inner-content {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        .layout-main-content {
          flex: 1;
          margin-top: 100px;
        }
        @media (max-width: 1199px) {
          .layout-content-page {
            margin-left: 0;
          }
          .layout-navbar-wrapper {
            left: 0;
          }
          .layout-main-content {
            margin-top: 150px;
          }
        }
        @media (max-width: 767px) {
          .layout-main-content {
            margin-top: 150px;
          }
          .layout-inner-content {
            padding: 12px;
          }
        }
      `}</style>
      <div className="wrapper layout-wrapper">
        {user && <Sidebar />}
        <div className={user ? 'content-page layout-content-page' : 'layout-content-page layout-content-page-no-sidebar'}>
          <div className={user ? 'layout-navbar-wrapper' : 'layout-navbar-wrapper layout-navbar-wrapper-no-sidebar'}>
            <div className="layout-inner-content">
              <Navbar />
            </div>
          </div>
          <div className="layout-main-content">
            <div className="layout-inner-content">
              <main role="main">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
        {user && <ChatBot />}
      </div>
    </>
  );
};

export default DocsLayout;
