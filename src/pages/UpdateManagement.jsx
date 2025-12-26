import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = parseInt(process.env.REACT_APP_ITEMS_PER_PAGE) || 10;

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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVersions = versions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(versions.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
        }
        button:hover:not(:disabled) { opacity: 0.9; }
        button:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <div style={{backgroundColor: '#3b82f6', padding: '24px', marginBottom: '24px', borderRadius: '8px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
          <h1 style={{color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
            <i className="ri-settings-3-line" style={{marginRight: '12px'}}></i>
            Quản lý cập nhật
          </h1>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                disabled={loading}
                style={{padding: '10px 20px', borderRadius: '6px', border: 'none', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s', backgroundColor: showCreateForm ? '#ef4444' : '#FFFFFF', color: showCreateForm ? '#FFFFFF' : '#3b82f6'}}
              >
                <i className={showCreateForm ? "ri-close-line" : "ri-add-line"}></i>
                {showCreateForm ? 'Đóng' : 'Phiên bản mới'}
              </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
            <div style={{padding: '14px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5'}}>
              <i className="ri-error-warning-line" style={{fontSize: '1.125rem'}}></i>
              <span>{error}</span>
              <button onClick={() => setError('')} style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.125rem', color: 'inherit'}}>×</button>
            </div>
          )}
          {success && (
            <div style={{padding: '14px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7'}}>
              <i className="ri-checkbox-circle-line" style={{fontSize: '1.125rem'}}></i>
              <span>{success}</span>
              <button onClick={() => setSuccess('')} style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.125rem', color: 'inherit'}}>×</button>
            </div>
          )}

          {/* Stats */}
          {statistics && (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px'}}>
              {[
                { t: 'Lượt kiểm tra', v: statistics.total_checks, i: 'ri-search-line', c: '#3b82f6', b: '#eff6ff' },
                { t: 'Lượt tải', v: statistics.total_downloads, i: 'ri-download-line', c: '#10b981', b: '#d1fae5' },
                { t: 'Lượt cài đặt', v: statistics.total_installs, i: 'ri-check-line', c: '#06b6d4', b: '#cffafe' },
                { t: 'Tỉ lệ thành công', v: `${statistics.success_rate ?? 0}%`, i: 'ri-pie-chart-line', c: '#f59e0b', b: '#fef3c7' }
              ].map((s, i) => (
                <div key={i} style={{backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e5e7eb'}}>
                  <div style={{width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', backgroundColor: s.b, color: s.c}}>
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
            <div style={{backgroundColor: '#FFFFFF', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden', border: '1px solid #e5e7eb'}}>
              <div style={{padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2 style={{fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <i className={editingId ? 'ri-edit-line' : 'ri-add-circle-line'}></i>
                  {editingId ? 'Chỉnh sửa phiên bản' : 'Tạo phiên bản mới'}
                </h2>
                <button onClick={resetForm} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9ca3af'}}>×</button>
              </div>
              <div style={{padding: '20px'}}>
                <form onSubmit={handleSubmit}>
                  <div style={{marginBottom: '24px'}}>
                    <h3 style={{fontSize: '0.9375rem', fontWeight: '600', color: '#374151', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="ri-information-line"></i>Thông tin cơ bản
                    </h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '0.875rem'}}>
                          Phiên bản <span style={{color: '#ef4444'}}>*</span>
                        </label>
                        <input type="text" name="version" value={formData.version} onChange={handleInputChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9375rem', backgroundColor: editingId ? '#f9fafb' : '#FFFFFF', cursor: editingId ? 'not-allowed' : 'text', boxSizing: 'border-box'}} placeholder="1.0.0.0" required readOnly={!!editingId} />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '0.875rem'}}>
                          Kiểu cập nhật <span style={{color: '#ef4444'}}>*</span>
                        </label>
                        <select name="update_type" value={formData.update_type} onChange={handleInputChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9375rem', backgroundColor: '#FFFFFF', cursor: 'pointer'}}>
                          <option value="optional">Tùy chọn</option>
                          <option value="recommended">Khuyến nghị</option>
                          <option value="mandatory">Bắt buộc</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{marginBottom: '32px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="ri-folder-zip-line"></i>File cập nhật
                    </h3>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.9rem'}}>
                      Đường dẫn file ZIP <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input type="text" name="download_url" value={formData.download_url} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem'}} placeholder="C:\Releases\SimpleBIM_v1.0.0.0.zip" required />
                    <div style={{marginTop: '8px', fontSize: '0.85rem', color: '#6b7280'}}>
                      <i className="ri-information-line"></i> File ZIP phải chứa Installer.exe và SimpleBIM.dll
                    </div>
                  </div>

                  <div style={{marginBottom: '32px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.9rem'}}>
                      Mã băm SHA256 <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input type="text" name="checksum_sha256" value={formData.checksum_sha256} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', fontFamily: 'monospace'}} placeholder="Nhập mã hash 64 ký tự..." required />
                  </div>

                  <div style={{marginBottom: '32px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="ri-file-text-line"></i>Ghi chú phát hành
                    </h3>
                    <textarea name="release_notes" value={formData.release_notes} onChange={handleInputChange} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit'}} placeholder="Mô tả tính năng mới, sửa lỗi..." required></textarea>
                  </div>

                  <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
                    <button type="button" onClick={resetForm} style={{padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#f9fafb', color: '#374151'}}>Hủy</button>
                    <button type="submit" disabled={loading} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#3b82f6', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {loading ? <><div style={{width: '14px', height: '14px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>{editingId ? 'Đang cập nhật...' : 'Đang phát hành...'}</> : <><i className={editingId ? 'ri-refresh-line' : 'ri-upload-cloud-line'}></i>{editingId ? 'Cập nhật' : 'Phát hành'}</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List */}
          <div style={{backgroundColor: '#FFFFFF', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb'}}>
            <div style={{padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2 style={{fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                <i className="ri-history-line"></i>Danh sách phiên bản
              </h2>
              <div style={{padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151'}}>
                <i className="ri-database-line"></i> {versions.length}
              </div>
            </div>

            {loading && !versions.length ? (
              <div style={{textAlign: 'center', padding: '50px 20px'}}>
                <div style={{width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px'}}></div>
                <p style={{color: '#9ca3af'}}>Đang tải...</p>
              </div>
            ) : versions.length === 0 ? (
              <div style={{textAlign: 'center', padding: '50px 20px'}}>
                <i className="ri-inbox-line" style={{fontSize: '2.5rem', color: '#d1d5db', display: 'block', marginBottom: '14px'}}></i>
                <p style={{color: '#9ca3af', marginBottom: '14px'}}>Chưa có phiên bản nào</p>
                <button onClick={() => setShowCreateForm(true)} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#3b82f6', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                  <i className="ri-add-line"></i>Tạo phiên bản đầu tiên
                </button>
              </div>
            ) : (
              currentVersions.map((v) => {
                const exp = expandedRow === v.id;
                const badge = getTypeBadge(v.update_type);
                return (
                  <div key={v.id} style={{padding: '16px 20px', borderBottom: '1px solid #e5e7eb'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '14px', flex: 1}}>
                        <div style={{width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', backgroundColor: v.is_active ? '#eff6ff' : '#f3f4f6', color: v.is_active ? '#3b82f6' : '#9ca3af'}}>
                          <i className="ri-git-commit-line"></i>
                        </div>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px'}}>
                            <span style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937'}}>v{v.version}</span>
                            {!v.is_active && <span style={{padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#6b7280'}}>Ngưng</span>}
                          </div>
                          <span style={{padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: badge.bg, color: badge.color}}>{badge.label}</span>
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                        <button onClick={() => setExpandedRow(exp ? null : v.id)} style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid ' + (exp ? '#93c5fd' : '#e5e7eb'), fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer', backgroundColor: exp ? '#eff6ff' : '#f9fafb', color: exp ? '#3b82f6' : '#6b7280'}}>
                          <i className={`ri-eye${exp ? '-off' : ''}-line`}></i> {exp ? 'Ẩn' : 'Xem'}
                        </button>
                        <button onClick={() => handleEdit(v)} style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer', backgroundColor: '#eff6ff', color: '#3b82f6'}}>
                          <i className="ri-edit-line"></i> Sửa
                        </button>
                        {v.is_active && (
                          <button onClick={() => handleDeactivate(v.id)} style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid #fcd34d', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer', backgroundColor: '#fef3c7', color: '#f59e0b'}}>
                            <i className="ri-shut-down-line"></i> Tắt
                          </button>
                        )}
                        <button onClick={() => handleDelete(v.id)} style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#ef4444'}}>
                          <i className="ri-delete-bin-line"></i> Xóa
                        </button>
                      </div>
                    </div>

                    {exp && (
                      <div style={{marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px'}}>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                            <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px'}}>LƯỢT TẢI</div>
                            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937'}}>{formatNumber(v.download_count || 0)}</div>
                          </div>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                            <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px'}}>LƯỢT CÀI</div>
                            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937'}}>{formatNumber(v.install_count || 0)}</div>
                          </div>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                            <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px'}}>NGÀY PHÁT HÀNH</div>
                            <div style={{fontSize: '1rem', fontWeight: 'bold', color: '#1f2937'}}>{new Date(v.release_date).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                        <div style={{marginBottom: '16px'}}>
                          <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '8px'}}>URL TẢI XUỐNG</div>
                          <div style={{padding: '12px', backgroundColor: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#4b5563', border: '1px solid #e5e7eb'}}>
                            <a href={v.download_url} target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'none'}}>
                              {v.download_url}
                            </a>
                          </div>
                        </div>
                        <div style={{marginBottom: '16px'}}>
                          <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '8px'}}>MÃ BĂM SHA256</div>
                          <div style={{padding: '12px', backgroundColor: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#4b5563', border: '1px solid #e5e7eb'}}>
                            {v.checksum_sha256}
                          </div>
                        </div>
                        <div>
                          <div style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '8px'}}>GHI CHÚ PHÁT HÀNH</div>
                          <div style={{padding: '16px', backgroundColor: '#fff', borderRadius: '8px', whiteSpace: 'pre-wrap', color: '#1f2937', lineHeight: '1.6', border: '1px solid #e5e7eb'}}>
                            {v.release_notes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{padding: '24px', borderTop: '1px solid #e5e7eb'}}>
                <div style={{display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px'}}>
                  <button
                    style={{
                      padding: '8px 16px',
                      background: currentPage === 1 ? '#f3f4f6' : '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#9ca3af' : '#1f2937',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="ri-arrow-left-s-line"></i> Trước
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: currentPage === pageNumber ? '#3b82f6' : '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: currentPage === pageNumber ? '#fff' : '#1f2937',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                          }}
                          onClick={() => paginate(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} style={{padding: '8px', color: '#cbd5e1'}}>...</span>
                      );
                    }
                    return null;
                  })}

                  <button
                    style={{
                      padding: '8px 16px',
                      background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage === totalPages ? '#9ca3af' : '#1f2937',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
                <div style={{textAlign: 'center', fontSize: '0.875rem', color: '#6b7280'}}>
                  Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, versions.length)} trên {versions.length} phiên bản
                </div>
              </div>
            )}
          </div>
    </>
  );
};

export default UpdateManagement;