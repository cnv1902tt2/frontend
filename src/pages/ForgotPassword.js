import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset, verifyPasswordReset } = useAuth();
  const [step, setStep] = useState(1); // 1: request, 2: verify
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
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(
      formData.email,
      formData.newPassword,
      formData.confirmPassword
    );

    if (result.success) {
      toast.success('OTP sent to your email!');
      setStep(2);
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();

    if (formData.otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code!');
      return;
    }

    setLoading(true);
    const result = await verifyPasswordReset(formData.email, formData.otpCode);

    if (result.success) {
      toast.success('Password reset successful! Please login.');
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
                <h3 className="mb-3">Reset Password</h3>
                <p>{step === 1 ? 'Enter your email and new password' : 'Enter OTP code from email'}</p>

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
                          <label>New Password</label>
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
                          <label>Confirm Password</label>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                    <p className="mt-3">
                      <Link to="/login" className="text-primary">
                        Back to Login
                      </Link>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyReset}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="alert alert-info" role="alert">
                          <small>Check your email ({formData.email}) for the 6-digit OTP code.</small>
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
                          <label>OTP Code</label>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Reset Password'}
                    </button>
                    <p className="mt-3">
                      <button
                        type="button"
                        className="btn btn-link text-primary p-0"
                        onClick={() => setStep(1)}
                      >
                        Back to Request
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
