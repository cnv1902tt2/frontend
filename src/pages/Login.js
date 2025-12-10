import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
      navigate('/dashboard');
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
        `}
      </style>

      {/* Background Pattern */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)', pointerEvents: 'none'}}></div>

      {/* Login Card */}
      <div style={{backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', padding: '48px', maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1}}>
        
        {/* Logo & Title */}
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'}}>
            <i className="ri-building-line" style={{fontSize: '2.5rem', color: '#fff'}}></i>
          </div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px'}}>SimpleBIM</h1>
          <p style={{fontSize: '1rem', color: '#64748b', margin: 0}}>Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form */}
        <div onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
          
          {/* Username Input */}
          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
              <i className="ri-user-line" style={{marginRight: '6px'}}></i>
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{width: '100%', padding: '14px 16px', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: '#fff', color: '#1e293b'}}
              placeholder="Nhập tên đăng nhập"
              required
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div style={{marginBottom: '24px', position: 'relative'}}>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
              <i className="ri-lock-line" style={{marginRight: '6px'}}></i>
              Mật khẩu
            </label>
            <div style={{position: 'relative'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{width: '100%', padding: '14px 16px', paddingRight: '48px', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: '#fff', color: '#1e293b'}}
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#475569'}}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#667eea'}}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" style={{color: '#667eea', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', transition: 'color 0.2s'}} className="link-hover">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            style={{width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '600', color: '#fff', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)', opacity: loading ? 0.6 : 1}}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={{width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}}></div>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <i className="ri-login-box-line" style={{fontSize: '1.25rem'}}></i>
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={{marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#64748b'}}>
          <p style={{margin: 0}}>
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" style={{color: '#667eea', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s'}} className="link-hover">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;