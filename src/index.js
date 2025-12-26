import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA with update notification
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Show update notification when new version is available
    const updateConfirmed = window.confirm(
      '🚀 Có phiên bản mới! Bấm OK để cập nhật ngay.'
    );
    
    if (updateConfirmed && registration.waiting) {
      // Tell service worker to skip waiting and activate new version
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page to get new content
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('App is ready for offline use.');
  }
});
