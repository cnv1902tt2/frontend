import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { updateService } from '../services/updateService';

// --- CSS Styles ---
const styles = {
  card: {
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    marginBottom: '24px',
    overflow: 'hidden'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    height: '100%',
    borderLeft: '4px solid transparent',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginRight: '20px',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9'
  },
  formGroup: {
    marginBottom: '20px'
  }
};

const UpdateManagement = () => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const [formData, setFormData] = useState({
    version: '',
    release_notes: '',
    download_url: '',
    file_size: '',
    checksum_sha256: '',
    update_type: 'optional',
    force_update: false,
    min_required_version: '1.0.0.0'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadVersions();
    loadStatistics();
  }, [navigate]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await updateService.getVersions(token);
      setVersions(data);
    } catch (err) {
      console.error('Không tải được danh sách phiên bản:', err);
      setError(err.response?.data?.detail || 'Tải danh sách phiên bản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await updateService.getStatistics(token);
      setStatistics(data);
    } catch (err) {
      console.error('Không tải được thống kê:', err);
      setError(err.response?.data?.detail || 'Tải thống kê thất bại');
    }
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Convert file_size from MB to bytes
      const fileSizeBytes = Math.round(parseFloat(formData.file_size) * 1024 * 1024);
      const payload = { 
        ...formData, 
        file_size: fileSizeBytes
      };
      await updateService.createVersion(token, payload);
      setSuccess(`Phát hành phiên bản ${formData.version} thành công!`);
      setShowCreateForm(false);
      setFormData({
        version: '',
        release_notes: '',
        download_url: '',
        file_size: '',
        checksum_sha256: '',
        update_type: 'optional',
        force_update: false,
        min_required_version: '1.0.0.0'
      });
      loadVersions();
      loadStatistics();
    } catch (err) {
      setError(err.response?.data?.detail || 'Tạo phiên bản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (versionId) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa phiên bản này?')) return;
    try {
      const token = localStorage.getItem('token');
      await updateService.deactivateVersion(token, versionId);
      setSuccess('Đã vô hiệu hóa phiên bản');
      loadVersions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Vô hiệu hóa phiên bản thất bại');
    }
  };

  const handleDelete = async (versionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiên bản này? Thao tác sẽ không thể hoàn tác.')) return;
    try {
      const token = localStorage.getItem('token');
      await updateService.deleteVersion(token, versionId);
      setSuccess('Xóa phiên bản thành công');
      loadVersions();
      loadStatistics();
    } catch (err) {
      setError(err.response?.data?.detail || 'Xóa phiên bản thất bại');
    }
  };

  const toggleDetails = (versionId) => {
    setExpandedRow(prev => (prev === versionId ? null : versionId));
  };

  const renderTypeBadge = (type, force) => {
    let colorClass = 'bg-secondary';
    const labelMap = {
      mandatory: 'Bắt buộc',
      recommended: 'Khuyến nghị',
      optional: 'Tùy chọn'
    };
    if (type === 'mandatory') colorClass = 'bg-danger';
    if (type === 'recommended') colorClass = 'bg-primary';
    if (type === 'optional') colorClass = 'bg-info';
    
    return (
      <div className="d-flex flex-column flex-sm-row gap-1">
        <span className={`badge ${colorClass} bg-opacity-10 text-${colorClass.replace('bg-', '')} border border-${colorClass.replace('bg-', '')} border-opacity-25`} style={{fontWeight: 500}}>
          {labelMap[type] || type}
        </span>
        {force && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Bắt buộc</span>}
      </div>
    );
  };

  return (
    <div className="wrapper bg-light min-vh-100">
      <Sidebar />
      <div className="content-page" style={{background:'white'}}>
        {/* Top Navbar */}
        <div className="iq-top-navbar">
          <div className="iq-navbar-custom">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <div className="iq-navbar-logo d-flex align-items-center justify-content-between">
                <i className="ri-menu-line wrapper-menu"></i>
                <a href="/dashboard" className="header-logo">
                  <h4 className="logo-title ml-3">SIMPLE BIM</h4>
                </a>
              </div>
            </nav>
          </div>
        </div>

        <div className="container-fluid py-4 px-3 px-md-4 bg-white">
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h3 className="fw-bold text-dark mb-1">Quản lý cập nhật</h3>
            </div>
            <button
              className={`btn ${showCreateForm ? 'btn-outline-danger' : 'btn-primary'} d-flex align-items-center gap-2 shadow-sm`}
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={loading}
              style={{borderRadius: '8px', padding: '10px 24px'}}
            >
              <i className={showCreateForm ? "ri-close-line" : "ri-add-line"}></i>
              {showCreateForm ? 'Đóng biểu mẫu' : 'Phiên bản mới'}
            </button>
          </div>

          {/* Alerts */}
          {(error || success) && (
            <div className={`alert ${error ? 'alert-danger' : 'alert-success'} alert-dismissible fade show border-0 shadow-sm mb-4`} role="alert" style={{borderRadius: '10px'}}>
              <div className="d-flex align-items-center">
                {error && <><i className="ri-error-warning-line me-3 fs-5"></i><div>{error}</div></>}
                {success && <><i className="ri-checkbox-circle-line me-3 fs-5"></i><div>{success}</div></>}
              </div>
              <button type="button" className="btn-close" onClick={() => {setError(''); setSuccess('')}}></button>
            </div>
          )}

          {/* Statistics Section */}
          {statistics && (
            <div className="mb-4">
              <h5 className="mb-3 fw-semibold text-dark">Tổng quan thống kê</h5>
              <div className="row g-3">
                {[
                  { 
                    title: 'Tổng lượt kiểm tra', 
                    value: statistics.total_checks, 
                    icon: 'ri-server-line', 
                    color: '#4e73df',
                    bgColor: '#e8f0fe'
                  },
                  { 
                    title: 'Tổng lượt tải', 
                    value: statistics.total_downloads, 
                    icon: 'ri-download-cloud-2-line', 
                    color: '#1cc88a',
                    bgColor: '#e6fffa'
                  },
                  { 
                    title: 'Tổng lượt cài đặt', 
                    value: statistics.total_installs, 
                    icon: 'ri-install-line', 
                    color: '#36b9cc',
                    bgColor: '#e0f7fa'
                  },
                  { 
                    title: 'Tỉ lệ thành công', 
                    value: `${statistics.success_rate ?? 0}%`, 
                    icon: 'ri-pie-chart-line', 
                    color: '#f6c23e',
                    bgColor: '#fff8e1'
                  }
                ].map((stat, index) => (
                  <div key={index} className="col-6 col-md-3">
                    <div style={{...styles.statCard, borderLeftColor: stat.color}}>
                      <div style={{...styles.statIcon, backgroundColor: stat.bgColor, color: stat.color}}>
                        <i className={stat.icon}></i>
                      </div>
                      <div>
                        <div className="text-muted small fw-semibold text-uppercase mb-1">{stat.title}</div>
                        <div className="h4 mb-0 fw-bold">{formatNumber(stat.value)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Form Section */}
          {showCreateForm && (
            <div className="mb-4">
              <div style={styles.card}>
                <div className="card-header bg-white border-bottom py-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0 fw-bold text-dark">
                      <i className="ri-upload-cloud-2-line me-2 text-primary"></i>
                      Tạo phiên bản mới
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() => setShowCreateForm(false)}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    {/* Basic Configuration */}
                    <div className="mb-4">
                      <h6 style={styles.sectionTitle}>
                        <i className="ri-settings-3-line me-2"></i>
                        Cấu hình cơ bản
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6 col-lg-3">
                          <label className="form-label fw-semibold text-dark mb-2">Phiên bản <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            name="version" 
                            value={formData.version} 
                            onChange={handleInputChange} 
                            placeholder="vd: 1.0.0.0" 
                            required 
                          />
                        </div>
                        <div className="col-md-6 col-lg-3">
                          <label className="form-label fw-semibold text-dark mb-2">Phiên bản tối thiểu</label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            name="min_required_version" 
                            value={formData.min_required_version} 
                            onChange={handleInputChange} 
                            placeholder="vd: 1.0.0.0" 
                          />
                        </div>
                        <div className="col-md-6 col-lg-3">
                          <label className="form-label fw-semibold text-dark mb-2">Kiểu cập nhật</label>
                          <select 
                            className="form-control form-control-lg d-block" 
                            name="update_type" 
                            value={formData.update_type} 
                            onChange={handleInputChange}
                          >
                            <option value="optional">Tùy chọn</option>
                            <option value="recommended">Khuyến nghị</option>
                            <option value="mandatory">Bắt buộc</option>
                          </select>
                        </div>
                        <div className="col-md-6 col-lg-3 d-flex align-items-end">
                          <div className="form-check form-switch mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              role="switch" 
                              id="force_update" 
                              name="force_update" 
                              checked={formData.force_update} 
                              onChange={handleInputChange} 
                            />
                            <label className="form-check-label fw-semibold text-dark" htmlFor="force_update">
                              Bắt buộc cập nhật
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* File Information */}
                    <div className="mb-4">
                      <h6 style={styles.sectionTitle}>
                        <i className="ri-file-line me-2"></i>
                        Thông tin tệp
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label fw-semibold text-dark mb-2">URL tải xuống <span className="text-danger">*</span></label>
                          <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="ri-link text-muted"></i>
                              </span>
                              <input 
                                type="url" 
                                className="form-control border-start-0 ps-0" 
                                name="download_url" 
                                value={formData.download_url} 
                                onChange={handleInputChange} 
                                placeholder="https://example.com/update.zip" 
                                required 
                              />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-dark mb-2">Dung lượng tệp (MB) <span className="text-danger">*</span></label>
                          <input 
                            type="number" 
                            className="form-control form-control-lg" 
                            name="file_size" 
                            value={formData.file_size} 
                            onChange={handleInputChange} 
                            placeholder="876" 
                            min="0.1"
                            step="0.1"
                            required 
                          />
                        </div>
                        <div className="col-12 mt-4">
                          <label className="form-label fw-semibold text-dark mb-2">Mã băm SHA256 <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg font-monospace" 
                            name="checksum_sha256" 
                            value={formData.checksum_sha256} 
                            onChange={handleInputChange} 
                            placeholder="Nhập mã hash 64 ký tự..." 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Release Notes */}
                    <div className="mb-4">
                      <h6 style={styles.sectionTitle}>
                        <i className="ri-file-text-line me-2"></i>
                        Ghi chú phát hành
                      </h6>
                      <div>
                        <label className="form-label fw-semibold text-dark mb-2">Nội dung <span className="text-danger">*</span></label>
                        <textarea 
                          className="form-control" 
                          name="release_notes" 
                          value={formData.release_notes} 
                          onChange={handleInputChange} 
                          rows="4" 
                          placeholder="Mô tả tính năng mới, sửa lỗi, cải tiến..." 
                          required
                          style={{ fontSize: '1rem' }}
                        ></textarea>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="d-flex justify-content-center gap-3 pt-3 border-top">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary px-4 mr-4" 
                        onClick={() => setShowCreateForm(false)}
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary px-4" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang phát hành...
                          </>
                        ) : (
                          <>
                            <i className="ri-upload-cloud-line me-2"></i>
                            Phát hành phiên bản
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Versions List */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="ri-history-line me-2"></i>
                Lịch sử phiên bản
              </h5>
              <span className="badge bg-light text-dark border px-3 py-2">
                <i className="ri-database-line me-1"></i>
                Tổng số: {versions.length}
              </span>
            </div>
            
            <div style={styles.card}>
              <div className="card-header bg-white border-bottom py-4">
                <h5 className="card-title mb-0 fw-semibold text-dark">Tất cả phiên bản đã phát hành</h5>
              </div>
              <div className="card-body p-0">
                {loading && !versions.length ? (
                  <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
                      <p className="text-muted">Đang tải danh sách phiên bản...</p>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                      <i className="ri-inbox-line fs-1 d-block mb-3 opacity-50"></i>
                      <p className="mb-2">Chưa có phiên bản nào</p>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowCreateForm(true)}
                      >
                        <i className="ri-add-line me-1"></i>
                        Tạo phiên bản đầu tiên
                      </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={styles.tableHeader}>
                        <tr>
                          <th className="ps-4 py-3" style={{width: '25%'}}>Thông tin phiên bản</th>
                          <th className="py-3" style={{width: '15%'}}>Ngày phát hành</th>
                          <th className="py-3" style={{width: '10%'}}>Kích thước</th>
                          <th className="py-3" style={{width: '15%'}}>Thống kê</th>
                          <th className="pe-4 py-3 text-end" style={{width: '15%'}}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map(version => {
                          const isExpanded = expandedRow === version.id;
                          const sizeMb = (version.file_size / (1024 * 1024)).toFixed(1);
                          return (
                            <React.Fragment key={version.id}>
                              <tr className={`${!version.is_active ? 'bg-light bg-opacity-50' : ''} border-bottom`}>
                                <td className="ps-4 py-3">
                                  <div className="d-flex align-items-start">
                                      <div className={`rounded-circle p-3 me-3 ${version.is_active ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                                          <i className="ri-git-commit-line fs-4"></i>
                                      </div>
                                      <div className="flex-grow-1">
                                          <div className="d-flex align-items-center gap-2 mb-2">
                                              <span className="fw-bold text-dark fs-6">{version.version}</span>
                                              {!version.is_active && (
                                                <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                                                  Ngưng hoạt động
                                                </span>
                                              )}
                                          </div>
                                          {renderTypeBadge(version.update_type, version.force_update)}
                                      </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="text-dark fw-medium mb-1">
                                    {new Date(version.release_date).toLocaleDateString('vi-VN', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </div>
                                  <small className="text-muted">
                                    {new Date(version.release_date).toLocaleTimeString('vi-VN', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </small>
                                </td>
                                <td className="py-3">
                                  <span className="badge bg-light text-dark border px-3 py-2">
                                    {sizeMb} MB
                                  </span>
                                </td>
                                <td className="py-3">
                                  <div className="small text-muted">
                                    <div className="d-flex gap-3">
                                      <span><i className="ri-download-line me-1"></i> {formatNumber(version.download_count || 0)}</span>
                                      <span><i className="ri-check-line me-1"></i> {formatNumber(version.install_count || 0)}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="pe-4 py-3 text-end">
                                  <div className="d-flex gap-2 justify-content-end">
                                    <button 
                                      className={`btn btn-sm ${isExpanded ? 'btn-info' : 'btn-outline-info'} rounded-pill px-3`} 
                                      onClick={() => toggleDetails(version.id)}
                                      type="button"
                                    >
                                        <i className={`ri-${isExpanded ? 'eye-off' : 'eye'}${isExpanded ? '-line' : ''} me-1`}></i>
                                        {isExpanded ? 'Ẩn' : 'Xem'}
                                    </button>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-light border rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="ri-more-2-fill"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{minWidth: '200px'}}>
                                            {version.is_active && (
                                              <li>
                                                <button type="button" className="dropdown-item text-warning" onClick={() => handleDeactivate(version.id)}>
                                                  <i className="ri-shut-down-line me-2"></i>Vô hiệu hóa phiên bản
                                                </button>
                                              </li>
                                            )}
                                            {version.is_active && <li><hr className="dropdown-divider" /></li>}
                                            <li>
                                              <button type="button" className="dropdown-item text-danger" onClick={() => handleDelete(version.id)}>
                                                <i className="ri-delete-bin-line me-2"></i>Xóa phiên bản
                                              </button>
                                            </li>
                                        </ul>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-light bg-opacity-25">
                                  <td colSpan="5" className="p-0">
                                    <div className="p-4 border-top">
                                      <div className="row g-4">
                                          <div className="col-lg-6">
                                              <label className="small text-uppercase fw-bold text-muted mb-2 d-block">
                                                <i className="ri-link me-1"></i>URL tải xuống
                                              </label>
                                              <div className="bg-white p-3 rounded border font-monospace small text-break">
                                                <a 
                                                  href={version.download_url} 
                                                  target="_blank" 
                                                  rel="noreferrer" 
                                                  className="text-decoration-none text-primary"
                                                >
                                                  {version.download_url}
                                                </a>
                                              </div>
                                          </div>
                                          <div className="col-lg-6">
                                              <label className="small text-uppercase fw-bold text-muted mb-2 d-block">
                                                <i className="ri-fingerprint-line me-1"></i>Mã băm SHA256
                                              </label>
                                              <div className="bg-white p-3 rounded border font-monospace small text-secondary text-break">
                                                {version.checksum_sha256}
                                              </div>
                                          </div>
                                          <div className="col-12">
                                              <label className="small text-uppercase fw-bold text-muted mb-2 d-block">
                                                <i className="ri-file-text-line me-1"></i>Ghi chú phát hành
                                              </label>
                                              <div className="bg-white p-4 rounded border">
                                                <div className="text-dark" style={{whiteSpace: 'pre-wrap'}}>
                                                  {version.release_notes}
                                                </div>
                                              </div>
                                          </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sidebar-overlay"></div>
    </div>
  );
};

export default UpdateManagement;