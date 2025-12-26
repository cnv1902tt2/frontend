import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Refactor: Clean design, no gradients/shadows, mobile-first
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      toast.success('Đăng nhập thành công!');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  // Clean styles - no gradients, minimal shadows
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '16px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '32px',
      maxWidth: '420px',
      width: '100%',
    },
    logoSection: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logoIcon: {
      width: '64px',
      height: '64px',
      backgroundColor: '#3b82f6',
      borderRadius: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px',
      margin: 0,
    },
    subtitle: {
      fontSize: '0.9375rem',
      color: '#6b7280',
      margin: 0,
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '0.9375rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#FFFFFF',
      color: '#1f2937',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#3b82f6',
    },
    passwordWrapper: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      fontSize: '1.125rem',
      padding: '4px',
    },
    optionsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '24px',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      color: '#4b5563',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      accentColor: '#3b82f6',
    },
    forgotLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    submitBtn: {
      width: '100%',
      padding: '12px',
      fontSize: '0.9375rem',
      fontWeight: '600',
      color: '#FFFFFF',
      backgroundColor: '#3b82f6',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
    },
    submitBtnDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #FFFFFF',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    registerLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}
      </style>

      <div style={styles.card}>
        {/* Logo & Title */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <i className="ri-building-line" style={{ fontSize: '2rem', color: '#FFFFFF' }}></i>
          </div>
          <h1 style={styles.title}>SimpleBIM</h1>
          <p style={styles.subtitle}>Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="username">
              <i className="ri-user-line" style={{ marginRight: '6px' }}></i>
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Nhập tên đăng nhập"
              required
              autoComplete="username"
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">
              <i className="ri-lock-line" style={{ marginRight: '6px' }}></i>
              Mật khẩu
            </label>
            <div style={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{ ...styles.input, paddingRight: '44px' }}
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <i className="ri-login-box-line" style={{ fontSize: '1.125rem' }}></i>
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ margin: 0 }}>
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" style={styles.registerLink}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;