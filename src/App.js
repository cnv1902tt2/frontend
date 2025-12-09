import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import KeyManagement from './pages/KeyManagement';
import UpdateManagement from './pages/UpdateManagement';
import Downloads from './pages/Downloads';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <KeyManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/keys"
              element={
                <ProtectedRoute>
                  <KeyManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/updates"
              element={
                <ProtectedRoute>
                  <UpdateManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/downloads" replace />} />
            <Route path="*" element={<Navigate to="/downloads" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
