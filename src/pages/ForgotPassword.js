import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset, verifyPasswordReset } = useAuth();
  const [step, setStep] = useState(1); // 1: yêu cầu, 2: xác minh
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

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', position: 'relative', overflow: 'hidden'}}>
      <style>
        {`
          @keyframes spin { to { transform: rotate(360deg); } }
          input:focus {
            outline: none !important;
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          }
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          button:active:not(:disabled) {
            transform: translateY(0);
          }
          .link-hover:hover {
            color: #764ba2 !important;
          }
          .step-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 32px;
          }
          .step-dot {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            transition: all 0.3s;
          }
          .step-dot.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .step-dot.inactive {
            background: #e2e8f0;
            color: #94a3b8;
          }
          .step-line {
            width: 60px;
            height: 3px;
            background: #e2e8f0;
            transition: all 0.3s;
          }
          .step-line.completed {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          }
        `}
      </style>

      {/* Background Pattern */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)', pointerEvents: 'none'}}></div>

      {/* Reset Password Card */}
      <div style={{backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', padding: '48px', maxWidth: '520px', width: '100%', position: 'relative', zIndex: 1}}>
        
        {/* Logo & Title */}
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'}}>
            <i className="ri-lock-password-line" style={{fontSize: '2.5rem', color: '#fff'}}></i>
          </div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>Đặt lại mật khẩu</h1>
          <p style={{fontSize: '1rem', color: '#64748b', margin: 0}}>
            {step === 1 ? 'Nhập thông tin để nhận mã OTP' : 'Xác minh mã OTP từ email'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step === 1 ? 'active' : 'inactive'}`}>1</div>
          <div className={`step-line ${step === 2 ? 'completed' : ''}`}></div>
          <div className={`step-dot ${step === 2 ? 'active' : 'inactive'}`}>2</div>
        </div>

        {/* Step 1: Request Reset */}
        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            {/* Email Input */}
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                <i className="ri-mail-line" style={{marginRight: '6px'}}></i>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{width: '100%', padding: '14px 16px', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: '#fff', color: '#1e293b'}}
                placeholder="example@email.com"
                required
                autoComplete="email"
              />
            </div>

            {/* New Password Input */}
            <div style={{marginBottom: '20px', position: 'relative'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                <i className="ri-lock-line" style={{marginRight: '6px'}}></i>
                Mật khẩu mới
              </label>
              <div style={{position: 'relative'}}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  style={{width: '100%', padding: '14px 16px', paddingRight: '48px', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: '#fff', color: '#1e293b'}}
                  placeholder="Ít nhất 8 ký tự"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem', padding: '4px'}}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div style={{marginBottom: '28px', position: 'relative'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                <i className="ri-lock-line" style={{marginRight: '6px'}}></i>
                Nhập lại mật khẩu
              </label>
              <div style={{position: 'relative'}}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{width: '100%', padding: '14px 16px', paddingRight: '48px', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: '#fff', color: '#1e293b'}}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem', padding: '4px'}}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '600', color: '#fff', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)', opacity: loading ? 0.6 : 1, marginBottom: '20px'}}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={{width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}}></div>
                  <span>Đang gửi OTP...</span>
                </>
              ) : (
                <>
                  <i className="ri-mail-send-line" style={{fontSize: '1.25rem'}}></i>
                  <span>Gửi mã OTP</span>
                </>
              )}
            </button>

            {/* Back to Login */}
            <div style={{textAlign: 'center'}}>
              <Link to="/login" style={{color: '#667eea', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px'}} className="link-hover">
                <i className="ri-arrow-left-line"></i>
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </form>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyReset}>
            {/* Info Alert */}
            <div style={{background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)', border: '2px solid #0ea5e9', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'start', gap: '12px'}}>
              <i className="ri-information-line" style={{fontSize: '1.5rem', color: '#0284c7', flexShrink: 0}}></i>
              <div>
                <p style={{margin: 0, fontSize: '0.875rem', color: '#0c4a6e', lineHeight: '1.5'}}>
                  Mã OTP 6 chữ số đã được gửi đến <strong>{formData.email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc spam).
                </p>
              </div>
            </div>

            {/* OTP Input */}
            <div style={{marginBottom: '28px'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px', textAlign: 'center'}}>
                <i className="ri-shield-keyhole-line" style={{marginRight: '6px'}}></i>
                Nhập mã OTP
              </label>
              <input
                type="text"
                name="otpCode"
                value={formData.otpCode}
                onChange={handleChange}
                maxLength="6"
                style={{width: '100%', padding: '20px 16px', fontSize: '2rem', border: '2px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: '#fff', color: '#1e293b', letterSpacing: '16px', textAlign: 'center', fontWeight: '700', fontFamily: 'monospace'}}
                placeholder="000000"
                required
                autoComplete="one-time-code"
              />
              <small style={{display: 'block', textAlign: 'center', color: '#64748b', marginTop: '8px', fontSize: '0.75rem'}}>
                Nhập 6 chữ số
              </small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '600', color: '#fff', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)', opacity: loading ? 0.6 : 1, marginBottom: '20px'}}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={{width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}}></div>
                  <span>Đang xác minh...</span>
                </>
              ) : (
                <>
                  <i className="ri-check-double-line" style={{fontSize: '1.25rem'}}></i>
                  <span>Xác minh & đặt lại mật khẩu</span>
                </>
              )}
            </button>

            {/* Back to Step 1 */}
            <div style={{textAlign: 'center'}}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{background: 'none', border: 'none', color: '#667eea', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', transition: 'color 0.2s', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: 0}}
                className="link-hover"
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
