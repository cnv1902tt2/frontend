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
    <div className="wrapper">
      <section className="login-content">
        <div className="container h-100">
          <div className="row justify-content-center align-items-center height-self-center">
            <div className="col-md-5 col-sm-12 col-12 align-self-center">
              <div className="sign-user_card">
                <h1 className="mb-3">SIMPLE BIM</h1>
                <h3 className="mb-3">Đặt lại mật khẩu</h3>
                <p>{step === 1 ? 'Nhập email và mật khẩu mới' : 'Nhập mã OTP từ email'}</p>

                {step === 1 ? (
                  <form onSubmit={handleRequestReset}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="floating-label form-group">
                          <input
                            className="floating-input form-control"
                            type="email"
                            name="email"
                            placeholder=" "
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                          <label>Email</label>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="floating-label form-group">
                          <input
                            className="floating-input form-control"
                            type="password"
                            name="newPassword"
                            placeholder=" "
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                          />
                          <label>Mật khẩu mới</label>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="floating-label form-group">
                          <input
                            className="floating-input form-control"
                            type="password"
                            name="confirmPassword"
                            placeholder=" "
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <label>Nhập lại mật khẩu</label>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
                    </button>
                    <p className="mt-3">
                      <Link to="/login" className="text-primary">
                        Quay lại đăng nhập
                      </Link>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyReset}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="alert alert-info" role="alert">
                          <small>Kiểm tra email ({formData.email}) để lấy mã OTP 6 chữ số.</small>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="floating-label form-group">
                          <input
                            className="floating-input form-control text-center"
                            type="text"
                            name="otpCode"
                            placeholder=" "
                            maxLength="6"
                            value={formData.otpCode}
                            onChange={handleChange}
                            required
                            style={{ letterSpacing: '10px', fontSize: '24px' }}
                          />
                          <label>Mã OTP</label>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Đang kiểm tra...' : 'Xác minh & đặt lại mật khẩu'}
                    </button>
                    <p className="mt-3">
                      <button
                        type="button"
                        className="btn btn-link text-primary p-0"
                        onClick={() => setStep(1)}
                      >
                        Quay lại bước gửi OTP
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
