import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Refactor: Clean design, no gradients/shadows, mobile-first
const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset, verifyPasswordReset } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    otpCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(
      formData.email,
      formData.newPassword,
      formData.confirmPassword
    );

    if (result.success) {
      toast.success('OTP đã được gửi tới email của bạn!');
      setStep(2);
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();

    if (formData.otpCode.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 chữ số hợp lệ!');
      return;
    }

    setLoading(true);
    const result = await verifyPasswordReset(formData.email, formData.otpCode);

    if (result.success) {
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  // Clean styles - no gradients, minimal design
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
      maxWidth: '460px',
      width: '100%',
    },
    logoSection: {
      textAlign: 'center',
      marginBottom: '24px',
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
    stepIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    stepDot: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.875rem',
      transition: 'all 0.2s',
    },
    stepDotActive: {
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
    },
    stepDotInactive: {
      backgroundColor: '#e5e7eb',
      color: '#9ca3af',
    },
    stepLine: {
      width: '48px',
      height: '2px',
      backgroundColor: '#e5e7eb',
    },
    stepLineCompleted: {
      backgroundColor: '#3b82f6',
    },
    formGroup: {
      marginBottom: '16px',
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
      marginBottom: '16px',
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
    backLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      color: '#3b82f6',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    infoBox: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '6px',
      padding: '12px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    otpInput: {
      width: '100%',
      padding: '16px',
      fontSize: '1.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#FFFFFF',
      color: '#1f2937',
      letterSpacing: '12px',
      textAlign: 'center',
      fontWeight: '700',
      fontFamily: 'monospace',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>

      <div style={styles.card}>
        {/* Logo & Title */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <i className="ri-lock-password-line" style={{ fontSize: '2rem', color: '#FFFFFF' }}></i>
          </div>
          <h1 style={styles.title}>Đặt lại mật khẩu</h1>
          <p style={styles.subtitle}>
            {step === 1 ? 'Nhập thông tin để nhận mã OTP' : 'Xác minh mã OTP từ email'}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div style={{ ...styles.stepDot, ...(step >= 1 ? styles.stepDotActive : styles.stepDotInactive) }}>1</div>
          <div style={{ ...styles.stepLine, ...(step >= 2 ? styles.stepLineCompleted : {}) }}></div>
          <div style={{ ...styles.stepDot, ...(step >= 2 ? styles.stepDotActive : styles.stepDotInactive) }}>2</div>
        </div>

        {/* Step 1: Request Reset */}
        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">
                <i className="ri-mail-line" style={{ marginRight: '6px' }}></i>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="example@email.com"
                required
                autoComplete="email"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* New Password */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="newPassword">
                <i className="ri-lock-line" style={{ marginRight: '6px' }}></i>
                Mật khẩu mới
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingRight: '44px' }}
                  placeholder="Ít nhất 8 ký tự"
                  required
                  autoComplete="new-password"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ ...styles.formGroup, marginBottom: '24px' }}>
              <label style={styles.label} htmlFor="confirmPassword">
                <i className="ri-lock-line" style={{ marginRight: '6px' }}></i>
                Nhập lại mật khẩu
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingRight: '44px' }}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  autoComplete="new-password"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Đang gửi OTP...</span>
                </>
              ) : (
                <>
                  <i className="ri-mail-send-line" style={{ fontSize: '1.125rem' }}></i>
                  <span>Gửi mã OTP</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={styles.backLink}>
                <i className="ri-arrow-left-line"></i>
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </form>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyReset}>
            {/* Info Alert */}
            <div style={styles.infoBox}>
              <i className="ri-information-line" style={{ fontSize: '1.25rem', color: '#0369a1', flexShrink: 0 }}></i>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#0c4a6e', lineHeight: '1.5' }}>
                Mã OTP 6 chữ số đã được gửi đến <strong>{formData.email}</strong>. Vui lòng kiểm tra hộp thư đến.
              </p>
            </div>

            {/* OTP Input */}
            <div style={{ ...styles.formGroup, marginBottom: '24px' }}>
              <label style={{ ...styles.label, textAlign: 'center' }} htmlFor="otpCode">
                <i className="ri-shield-keyhole-line" style={{ marginRight: '6px' }}></i>
                Nhập mã OTP
              </label>
              <input
                id="otpCode"
                type="text"
                name="otpCode"
                value={formData.otpCode}
                onChange={handleChange}
                maxLength="6"
                style={styles.otpInput}
                placeholder="000000"
                required
                autoComplete="one-time-code"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <small style={{ display: 'block', textAlign: 'center', color: '#6b7280', marginTop: '6px', fontSize: '0.75rem' }}>
                Nhập 6 chữ số
              </small>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Đang xác minh...</span>
                </>
              ) : (
                <>
                  <i className="ri-check-double-line" style={{ fontSize: '1.125rem' }}></i>
                  <span>Xác minh & đặt lại mật khẩu</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ ...styles.backLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <i className="ri-arrow-left-line"></i>
                <span>Quay lại nhập email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
