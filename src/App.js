import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Layout';
import DocsLayout from './components/DocsLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import KeyManagement from './pages/KeyManagement';
import UpdateManagement from './pages/UpdateManagement';
import Downloads from './pages/Downloads';
import Home from './pages/Home';
import Structure from './pages/Structure';
import Guide from './pages/Guide';
import Search from './pages/Search';
import UsageGuide from './pages/UsageGuide';
import PromptGenerator from './pages/PromptGenerator';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <Routes>
          {/* Public routes - không cần layout */}
          <Route path="/admin" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public route với AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/downloads" element={<Downloads />} />
          </Route>

          {/* Protected Admin routes - cần đăng nhập */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<Home />} />
            <Route path="/admin/keys" element={<KeyManagement />} />
            <Route path="/admin/updates" element={<UpdateManagement />} />
          </Route>

          {/* Public Documentation route - không cần đăng nhập */}
          <Route element={<DocsLayout />}>
            <Route path="/" element={<Downloads />} />
          </Route>

          {/* Protected Documentation routes - cần đăng nhập */}
          <Route element={<ProtectedRoute><DocsLayout /></ProtectedRoute>}>
            <Route path="/admin/structure" element={<Structure />} />
            <Route path="/admin/guide" element={<Guide />} />
            <Route path="/admin/search" element={<Search />} />
            <Route path="/admin/usage-guide" element={<UsageGuide />} />
            <Route path="/admin/prompt-generator" element={<PromptGenerator />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
