import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { updateService } from '../services/updateService';

const UpdateManagement = () => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await updateService.getVersions(token);
      setVersions(data);
    } catch (err) {
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
    }
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (editingId) return await handleUpdate(e);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare data - file_size is optional, backend will calculate from file
      const submitData = {
        version: formData.version.trim(),
        release_notes: formData.release_notes.trim(),
        download_url: formData.download_url.trim(),
        checksum_sha256: formData.checksum_sha256.trim(),
        update_type: formData.update_type || 'optional',
        force_update: formData.force_update === true || formData.force_update === 'true',
        min_required_version: formData.min_required_version || '1.0.0.0'
      };
      
      // Only include file_size if provided
      if (formData.file_size) {
        const fileSizeBytes = Math.round(parseFloat(formData.file_size) * 1024 * 1024);
        if (!isNaN(fileSizeBytes) && fileSizeBytes > 0) {
          submitData.file_size = fileSizeBytes;
        }
      }
      
      console.log('Submitting data:', submitData);
      await updateService.createVersion(token, submitData);
      setSuccess(`Phát hành phiên bản ${formData.version} thành công!`);
      resetForm();
      loadVersions();
      loadStatistics();
    } catch (err) {
      const detail = err.response?.data?.detail;
      // Handle validation errors (array of objects) or string error
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(', '));
      } else if (typeof detail === 'object') {
        setError(JSON.stringify(detail));
      } else {
        setError(detail || 'Tạo phiên bản thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (version) => {
    setEditingId(version.id);
    // Convert file_size from bytes to MB for display in form
    const fileSizeMB = version.file_size ? (version.file_size / (1024 * 1024)).toFixed(2) : '';
    setFormData({
      version: version.version,
      release_notes: version.release_notes || '',
      download_url: version.download_url || '',
      file_size: fileSizeMB,
      checksum_sha256: version.checksum_sha256 || '',
      update_type: version.update_type || 'optional',
      force_update: version.force_update || false,
      min_required_version: version.min_required_version || '1.0.0.0'
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const updateData = {};
      
      // Only include fields that have values
      if (formData.release_notes?.trim()) updateData.release_notes = formData.release_notes.trim();
      if (formData.download_url?.trim()) updateData.download_url = formData.download_url.trim();
      if (formData.checksum_sha256?.trim()) updateData.checksum_sha256 = formData.checksum_sha256.trim();
      if (formData.update_type) updateData.update_type = formData.update_type;
      if (formData.min_required_version?.trim()) updateData.min_required_version = formData.min_required_version.trim();
      
      // Handle boolean force_update
      updateData.force_update = formData.force_update === true || formData.force_update === 'true';
      
      // Convert file_size from MB to bytes if provided and valid
      if (formData.file_size) {
        const fileSizeNum = parseFloat(formData.file_size);
        if (!isNaN(fileSizeNum) && fileSizeNum > 0) {
          updateData.file_size = Math.round(fileSizeNum * 1024 * 1024);
        }
      }
      
      console.log('Update data:', updateData);
      const result = await updateService.updateVersion(token, editingId, updateData);
      console.log('Update result:', result);
      setSuccess('Cập nhật phiên bản thành công!');
      resetForm();
      await loadVersions();
      await loadStatistics();
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error detail:', err.response?.data?.detail);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(', '));
      } else if (typeof detail === 'object') {
        setError(JSON.stringify(detail));
      } else {
        setError(detail || err.message || 'Cập nhật phiên bản thất bại');
      }
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
    if (!window.confirm('Bạn có chắc muốn xóa phiên bản này?')) return;
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

  const resetForm = () => {
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
    setShowCreateForm(false);
    setEditingId(null);
  };

  const getTypeBadge = (type) => {
    const c = {
      mandatory: { label: 'Bắt buộc', color: '#ef4444', bg: '#fee2e2' },
      recommended: { label: 'Khuyến nghị', color: '#f59e0b', bg: '#fef3c7' },
      optional: { label: 'Tùy chọn', color: '#3b82f6', bg: '#dbeafe' }
    };
    return c[type] || c.optional;
  };

  return (
    <div className="wrapper" style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
        }
        button:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); }
        button:active:not(:disabled) { transform: translateY(0); }
        .stat-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
      `}</style>

      <Sidebar />
      <div className="content-page">
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

        <div className="container-fluid p-4">
          {/* Header */}
          <div style={{background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '32px 24px', marginBottom: '32px', borderRadius: '0 0 24px 24px', boxShadow: '0 10px 40px rgba(99,102,241,0.2)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
              <h1 style={{color: '#fff', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>
                <i className="ri-settings-3-line" style={{marginRight: '12px'}}></i>
                Quản lý cập nhật
              </h1>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                disabled={loading}
                style={{padding: '12px 24px', borderRadius: '12px', border: showCreateForm ? '2px solid rgba(255,255,255,0.3)' : 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', background: showCreateForm ? 'rgba(239,68,68,0.1)' : '#fff', color: showCreateForm ? '#fff' : '#6366f1'}}
              >
                <i className={showCreateForm ? "ri-close-line" : "ri-add-line"}></i>
                {showCreateForm ? 'Đóng' : 'Phiên bản mới'}
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div style={{padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5'}}>
              <i className="ri-error-warning-line" style={{fontSize: '1.25rem'}}></i>
              <span>{error}</span>
              <button onClick={() => setError('')} style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'inherit'}}>×</button>
            </div>
          )}
          {success && (
            <div style={{padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7'}}>
              <i className="ri-checkbox-circle-line" style={{fontSize: '1.25rem'}}></i>
              <span>{success}</span>
              <button onClick={() => setSuccess('')} style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'inherit'}}>×</button>
            </div>
          )}

          {/* Stats */}
          {statistics && (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px'}}>
              {[
                { t: 'Lượt kiểm tra', v: statistics.total_checks, i: 'ri-search-line', c: '#6366f1', b: '#eef2ff' },
                { t: 'Lượt tải', v: statistics.total_downloads, i: 'ri-download-line', c: '#10b981', b: '#d1fae5' },
                { t: 'Lượt cài đặt', v: statistics.total_installs, i: 'ri-check-line', c: '#06b6d4', b: '#cffafe' },
                { t: 'Tỉ lệ thành công', v: `${statistics.success_rate ?? 0}%`, i: 'ri-pie-chart-line', c: '#f59e0b', b: '#fef3c7' }
              ].map((s, i) => (
                <div key={i} className="stat-hover" style={{backgroundColor: '#fff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'all 0.2s'}}>
                  <div style={{width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', backgroundColor: s.b, color: s.c}}>
                    <i className={s.i}></i>
                  </div>
                  <div>
                    <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '4px'}}>{s.t}</div>
                    <div style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b'}}>{formatNumber(s.v)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          {showCreateForm && (
            <div style={{backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '24px', overflow: 'hidden', border: '1px solid #f1f5f9'}}>
              <div style={{padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <i className={editingId ? 'ri-edit-line' : 'ri-add-circle-line'}></i>
                  {editingId ? 'Chỉnh sửa phiên bản' : 'Tạo phiên bản mới'}
                </h2>
                <button onClick={resetForm} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8'}}>×</button>
              </div>
              <div style={{padding: '24px'}}>
                <form onSubmit={handleSubmit}>
                  <div style={{marginBottom: '32px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="ri-information-line"></i>Thông tin cơ bản
                    </h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem'}}>
                          Phiên bản <span style={{color: '#ef4444'}}>*</span>
                        </label>
                        <input type="text" name="version" value={formData.version} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', backgroundColor: editingId ? '#f1f5f9' : '#fff', cursor: editingId ? 'not-allowed' : 'text'}} placeholder="1.0.0.0" required readOnly={!!editingId} />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem'}}>
                          Kiểu cập nhật <span style={{color: '#ef4444'}}>*</span>
                        </label>
                        <select name="update_type" value={formData.update_type} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', backgroundColor: '#fff', cursor: 'pointer'}}>
                          <option value="optional">Tùy chọn</option>
                          <option value="recommended">Khuyến nghị</option>
                          <option value="mandatory">Bắt buộc</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{marginBottom: '32px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="ri-folder-zip-line"></i>File cập nhật
                    </h3>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem'}}>
                      Đường dẫn file ZIP <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input type="text" name="download_url" value={formData.download_url} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem'}} placeholder="C:\Releases\SimpleBIM_v1.0.0.0.zip" required />
                    <div style={{marginTop: '8px', fontSize: '0.85rem', color: '#64748b'}}>
                      <i className="ri-information-line"></i> File ZIP phải chứa Installer.exe và SimpleBIM.dll
                    </div>
                  </div>

                  <div style={{marginBottom: '32px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem'}}>
                      Mã băm SHA256 <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input type="text" name="checksum_sha256" value={formData.checksum_sha256} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', fontFamily: 'monospace'}} placeholder="Nhập mã hash 64 ký tự..." required />
                  </div>

                  <div style={{marginBottom: '32px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="ri-file-text-line"></i>Ghi chú phát hành
                    </h3>
                    <textarea name="release_notes" value={formData.release_notes} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit'}} placeholder="Mô tả tính năng mới, sửa lỗi..." required></textarea>
                  </div>

                  <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0'}}>
                    <button type="button" onClick={resetForm} style={{padding: '12px 24px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#f1f5f9', color: '#475569'}}>Hủy</button>
                    <button type="submit" disabled={loading} style={{padding: '12px 24px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {loading ? <><div style={{width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>{editingId ? 'Đang cập nhật...' : 'Đang phát hành...'}</> : <><i className={editingId ? 'ri-refresh-line' : 'ri-upload-cloud-line'}></i>{editingId ? 'Cập nhật' : 'Phát hành'}</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List */}
          <div style={{backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #f1f5f9'}}>
            <div style={{padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'}}>
                <i className="ri-history-line"></i>Danh sách phiên bản
              </h2>
              <div style={{padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: '#f1f5f9', color: '#475569'}}>
                <i className="ri-database-line"></i> {versions.length}
              </div>
            </div>

            {loading && !versions.length ? (
              <div style={{textAlign: 'center', padding: '60px 20px'}}>
                <div style={{width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
                <p style={{color: '#94a3b8'}}>Đang tải...</p>
              </div>
            ) : versions.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px 20px'}}>
                <i className="ri-inbox-line" style={{fontSize: '3rem', color: '#cbd5e1', display: 'block', marginBottom: '16px'}}></i>
                <p style={{color: '#94a3b8', marginBottom: '16px'}}>Chưa có phiên bản nào</p>
                <button onClick={() => setShowCreateForm(true)} style={{padding: '12px 24px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                  <i className="ri-add-line"></i>Tạo phiên bản đầu tiên
                </button>
              </div>
            ) : (
              versions.map((v) => {
                const exp = expandedRow === v.id;
                const badge = getTypeBadge(v.update_type);
                return (
                  <div key={v.id} style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '16px', flex: 1}}>
                        <div style={{width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', backgroundColor: v.is_active ? '#eef2ff' : '#f1f5f9', color: v.is_active ? '#6366f1' : '#94a3b8'}}>
                          <i className="ri-git-commit-line"></i>
                        </div>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                            <span style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b'}}>v{v.version}</span>
                            {!v.is_active && <span style={{padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f1f5f9', color: '#64748b'}}>Ngưng</span>}
                          </div>
                          <span style={{padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: badge.bg, color: badge.color}}>{badge.label}</span>
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        <button onClick={() => setExpandedRow(exp ? null : v.id)} style={{padding: '8px 16px', borderRadius: '10px', border: 'none', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', backgroundColor: exp ? '#eef2ff' : '#f8fafc', color: exp ? '#6366f1' : '#64748b'}}>
                          <i className={`ri-eye${exp ? '-off' : ''}-line`}></i> {exp ? 'Ẩn' : 'Xem'}
                        </button>
                        <button onClick={() => handleEdit(v)} style={{padding: '8px 16px', borderRadius: '10px', border: 'none', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#eff6ff', color: '#3b82f6'}}>
                          <i className="ri-edit-line"></i> Sửa
                        </button>
                        {v.is_active && (
                          <button onClick={() => handleDeactivate(v.id)} style={{padding: '8px 16px', borderRadius: '10px', border: 'none', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#fef3c7', color: '#f59e0b'}}>
                            <i className="ri-shut-down-line"></i> Tắt
                          </button>
                        )}
                        <button onClick={() => handleDelete(v.id)} style={{padding: '8px 16px', borderRadius: '10px', border: 'none', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#ef4444'}}>
                          <i className="ri-delete-bin-line"></i> Xóa
                        </button>
                      </div>
                    </div>

                    {exp && (
                      <div style={{marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px'}}>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '10px'}}>
                            <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '6px'}}>LƯỢT TẢI</div>
                            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b'}}>{formatNumber(v.download_count || 0)}</div>
                          </div>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '10px'}}>
                            <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '6px'}}>LƯỢT CÀI</div>
                            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b'}}>{formatNumber(v.install_count || 0)}</div>
                          </div>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '10px'}}>
                            <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '6px'}}>NGÀY PHÁT HÀNH</div>
                            <div style={{fontSize: '1rem', fontWeight: 'bold', color: '#1e293b'}}>{new Date(v.release_date).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                        <div style={{marginBottom: '16px'}}>
                          <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '8px'}}>URL TẢI XUỐNG</div>
                          <div style={{padding: '12px', backgroundColor: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#475569'}}>
                            <a href={v.download_url} target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'none'}}>
                              {v.download_url}
                            </a>
                          </div>
                        </div>
                        <div style={{marginBottom: '16px'}}>
                          <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '8px'}}>MÃ BĂM SHA256</div>
                          <div style={{padding: '12px', backgroundColor: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#475569'}}>
                            {v.checksum_sha256}
                          </div>
                        </div>
                        <div>
                          <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '8px'}}>GHI CHÚ PHÁT HÀNH</div>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '8px', whiteSpace: 'pre-wrap', color: '#1e293b', lineHeight: '1.6'}}>
                            {v.release_notes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="sidebar-overlay"></div>
    </div>
  );
};

export default UpdateManagement;