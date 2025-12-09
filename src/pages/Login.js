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
    <div className="wrapper">
      <section className="login-content">
        <div className="container h-100">
          <div className="row justify-content-center align-items-center height-self-center">
            <div className="col-md-5 col-sm-12 col-12 align-self-center">
              <div className="sign-user_card">
                <h1 className="mb-3">SIMPLE BIM</h1>
                <h3 className="mb-3">Đăng nhập</h3>
                <p>Đăng nhập để tiếp tục.</p>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="floating-label form-group">
                        <input
                          className="floating-input form-control"
                          type="text"
                          name="username"
                          placeholder=" "
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                        <label>Tên đăng nhập</label>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="floating-label form-group">
                        <input
                          className="floating-input form-control"
                          type="password"
                          name="password"
                          placeholder=" "
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <label>Mật khẩu</label>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="custom-control custom-checkbox mb-3 text-left">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customCheck1"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                        />
                        <label className="custom-control-label" htmlFor="customCheck1">
                          Ghi nhớ đăng nhập
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <Link to="/forgot-password" className="text-primary float-right">
                        Quên mật khẩu?
                      </Link>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
