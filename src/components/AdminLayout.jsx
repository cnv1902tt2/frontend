import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBot from './ChatBotNew';

const AdminLayout = () => {
  const styles = {
    wrapper: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
    },
    contentPage: {
      flex: 1,
      minWidth: 0,
      width: '100%',
    },
    innerContent: {
      padding: '16px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
  };

  return (
    <div className="wrapper" style={styles.wrapper}>
      <Sidebar />
      <div className="content-page" style={styles.contentPage}>
        <div style={styles.innerContent}>
          <Outlet />
        </div>
      </div>
      <div className="sidebar-overlay"></div>
      <ChatBot />
    </div>
  );
};

export default AdminLayout;
