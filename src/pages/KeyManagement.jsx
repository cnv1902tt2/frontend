import React, { useState, useEffect } from 'react';
import { keyAPI } from '../services/api';
import { toast } from 'react-toastify';

const KeyManagement = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = parseInt(process.env.REACT_APP_ITEMS_PER_PAGE) || 10;
  const [formData, setFormData] = useState({
    type: 'trial',
    note: '',
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await keyAPI.list();
      setKeys(response.data);
    } catch (error) {
      toast.error('Tải danh sách key thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await keyAPI.create(formData.type, formData.note);
      const newKey = response.data;
      setKeys(prevKeys => [newKey, ...prevKeys]);
      toast.success('Tạo key thành công!');
      setShowCreateModal(false);
      setFormData({ type: 'trial', note: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Tạo key thất bại');
    }
  };

  const handleUpdateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await keyAPI.update(selectedKey.key_value, {
        is_active: selectedKey.is_active,
        note: selectedKey.note,
      });
      const updatedKey = response.data;
      setKeys(prevKeys => 
        prevKeys.map(key => 
          key.key_value === selectedKey.key_value ? updatedKey : key
        )
      );
      toast.success('Cập nhật key thành công!');
      setShowEditModal(false);
      setSelectedKey(null);
    } catch (error) {
      toast.error('Cập nhật key thất bại');
    }
  };

  const handleDeleteKey = async (keyValue) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa key này?')) {
      try {
        await keyAPI.delete(keyValue);
        setKeys(prevKeys => prevKeys.filter(key => key.key_value !== keyValue));
        toast.success('Xóa key thành công!');
      } catch (error) {
        toast.error('Xóa key thất bại');
      }
    }
  };

  const handleToggleActive = async (key) => {
    try {
      const response = await keyAPI.update(key.key_value, {
        is_active: !key.is_active,
        note: key.note,
      });
      const updatedKey = response.data;
      setKeys(prevKeys => 
        prevKeys.map(k => 
          k.key_value === key.key_value ? updatedKey : k
        )
      );
      toast.success(`Key ${!key.is_active ? 'đã kích hoạt' : 'đã khóa'}!`);
    } catch (error) {
      toast.error('Cập nhật trạng thái key thất bại');
    }
  };

  const openEditModal = (key) => {
    setSelectedKey({ ...key });
    setShowEditModal(true);
  };

  const getKeyType = (expiredAt) => {
    if (!expiredAt) return 'lifetime';
    const expireDate = new Date(expiredAt);
    if (expireDate.getFullYear() >= 3000) return 'lifetime';
    const daysDiff = Math.ceil((expireDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return 'trial';
    if (daysDiff <= 35) return 'month';
    if (daysDiff <= 400) return 'year';
    return 'lifetime';
  };

  const getKeyTypeLabel = (expiredAt) => {
    if (!expiredAt) return 'Không xác định';
    const expireDate = new Date(expiredAt);
    if (expireDate.getFullYear() >= 3000) return 'Trọn đời';
    const diffDays = Math.ceil((expireDate - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'Dùng thử';
    if (diffDays <= 35) return 'Theo tháng';
    if (diffDays <= 400) return 'Theo năm';
    return 'Trọn đời';
  };

  const tabFilteredKeys = keys.filter((key) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return key.is_active;
    if (activeTab === 'inactive') return !key.is_active;
    return getKeyType(key.expired_at) === activeTab;
  });

  const filteredKeys = tabFilteredKeys.filter((key) =>
    key.key_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (key.note && key.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (key.machine_name && key.machine_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentKeys = filteredKeys.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Đã sao chép key!');
    }).catch(() => {
      toast.error('Sao chép key thất bại');
    });
  };

  const getTabCount = (tab) => {
    if (tab === 'all') return keys.length;
    if (tab === 'active') return keys.filter(k => k.is_active).length;
    if (tab === 'inactive') return keys.filter(k => !k.is_active).length;
    return keys.filter(k => getKeyType(k.expired_at) === tab).length;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Clean styles - no gradients, minimal shadows
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
    },
    header: {
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
      padding: '24px',
      marginBottom: '24px',
      borderRadius: '8px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '24px',
    },
    tabButton: (isActive) => ({
      padding: '10px 16px',
      fontSize: '0.875rem',
      fontWeight: '500',
      border: 'none',
      backgroundColor: isActive ? '#3b82f6' : 'transparent',
      color: isActive ? '#FFFFFF' : '#6b7280',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      minWidth: '80px',
    }),
    badge: (type) => {
      const colors = {
        success: { bg: '#dcfce7', text: '#166534' },
        danger: { bg: '#fee2e2', text: '#991b1b' },
        info: { bg: '#dbeafe', text: '#1e40af' },
        warning: { bg: '#fef3c7', text: '#92400e' },
      };
      const c = colors[type] || colors.info;
      return {
        display: 'inline-block',
        padding: '4px 10px',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '4px',
        backgroundColor: c.bg,
        color: c.text,
      };
    },
    actionButton: (variant) => {
      const variants = {
        primary: { bg: '#3b82f6', color: '#FFFFFF' },
        success: { bg: '#10b981', color: '#FFFFFF' },
        warning: { bg: '#f59e0b', color: '#FFFFFF' },
        danger: { bg: '#ef4444', color: '#FFFFFF' },
      };
      const v = variants[variant] || variants.primary;
      return {
        padding: '10px 18px',
        fontSize: '0.875rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: v.bg,
        color: v.color,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      };
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
    },
  };

  return (
    <>
      {/* Header */}
      <div style={styles.header}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
              <i className="ri-key-2-line me-2"></i>
              Quản lý License Key
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
              Tổng số: {keys.length} key · Hoạt động: {getTabCount('active')} · Khóa: {getTabCount('inactive')}
            </p>
          </div>
          <button
            style={styles.actionButton('primary')}
            onClick={() => setShowCreateModal(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <i className="ri-add-circle-line" style={{fontSize: '1.25rem'}}></i>
            <span className="d-none d-sm-inline">Tạo key mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
          <div style={{...styles.card, padding: '20px', marginBottom: '24px'}}>
            <div style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px'}}>
              {[
                { key: 'all', label: 'Tất cả', icon: 'ri-apps-line' },
                { key: 'trial', label: 'Dùng thử', icon: 'ri-timer-line' },
                { key: 'month', label: 'Theo tháng', icon: 'ri-calendar-line' },
                { key: 'year', label: 'Theo năm', icon: 'ri-calendar-2-line' },
                { key: 'lifetime', label: 'Trọn đời', icon: 'ri-infinity-line' },
                { key: 'active', label: 'Hoạt động', icon: 'ri-checkbox-circle-line' },
                { key: 'inactive', label: 'Khóa', icon: 'ri-close-circle-line' }
              ].map(tab => (
                <button
                  key={tab.key}
                  style={styles.tabButton(activeTab === tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <i className={tab.icon} style={{fontSize: '1.25rem'}}></i>
                  <span>{tab.label}</span>
                  <span style={{
                    ...styles.badge(activeTab === tab.key ? 'success' : 'info'),
                    fontSize: '0.7rem',
                    padding: '2px 8px'
                  }}>
                    {getTabCount(tab.key)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div style={{position: 'relative'}}>
              <i className="ri-search-line" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '1.25rem'
              }}></i>
              <input
                type="search"
                placeholder="Tìm kiếm key, ghi chú, thiết bị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  fontSize: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Keys List */}
          <div style={styles.card}>
            {loading ? (
              <div style={{padding: '80px 20px', textAlign: 'center'}}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                <p style={{color: '#64748b', fontSize: '1rem'}}>Đang tải danh sách key...</p>
              </div>
            ) : currentKeys.length === 0 ? (
              <div style={{padding: '80px 20px', textAlign: 'center'}}>
                <i className="ri-inbox-line" style={{fontSize: '4rem', color: '#cbd5e1', marginBottom: '16px', display: 'block'}}></i>
                <h3 style={{color: '#64748b', fontSize: '1.25rem', marginBottom: '8px'}}>Không có key nào</h3>
                <p style={{color: '#94a3b8', marginBottom: '24px'}}>
                  {searchTerm ? 'Không tìm thấy key phù hợp' : 'Bắt đầu bằng cách tạo key mới'}
                </p>
                {!searchTerm && (
                  <button
                    style={styles.actionButton('primary')}
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i className="ri-add-line"></i>
                    Tạo key đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="d-none d-lg-block" style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{background: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                        <th style={{padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Giá trị Key</th>
                        <th style={{padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Loại</th>
                        <th style={{padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Trạng thái</th>
                        <th style={{padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Ngày tạo</th>
                        <th style={{padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Hết hạn</th>
                        <th style={{padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Thiết bị</th>
                        <th style={{padding: '16px 20px', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentKeys.map((key, index) => (
                        <tr key={key.key_value} style={{borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s'}}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{padding: '16px 20px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                              <div style={{flex: 1}}>
                                <code style={{fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                                  {key.key_value}
                                </code>
                                {key.note && (
                                  <small style={{color: '#64748b', fontSize: '0.75rem'}}>{key.note}</small>
                                )}
                              </div>
                              <button
                                style={{
                                  padding: '8px 12px',
                                  background: '#f3f4f6',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  color: '#3b82f6',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => copyToClipboard(key.key_value)}
                                title="Copy key"
                                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              >
                                <i className="ri-file-copy-line"></i>
                              </button>
                            </div>
                          </td>
                          <td style={{padding: '16px 20px'}}>
                            <span style={styles.badge('info')}>
                              {getKeyTypeLabel(key.expired_at)}
                            </span>
                          </td>
                          <td style={{padding: '16px 20px'}}>
                            <span style={styles.badge(key.is_active ? 'success' : 'danger')}>
                              <i className={`ri-${key.is_active ? 'checkbox-circle' : 'close-circle'}-line me-1`}></i>
                              {key.is_active ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td style={{padding: '16px 20px', fontSize: '0.875rem', color: '#64748b'}}>
                            {formatDate(key.created_at)}
                          </td>
                          <td style={{padding: '16px 20px', fontSize: '0.875rem', color: '#64748b'}}>
                            {formatDate(key.expired_at)}
                          </td>
                          <td style={{padding: '16px 20px', fontSize: '0.75rem', color: '#64748b'}}>
                            {key.machine_name || 'Chưa kích hoạt'}
                            {key.os_version && <div>OS: {key.os_version}</div>}
                            {key.revit_version && <div>Revit: {key.revit_version}</div>}
                          </td>
                          <td style={{padding: '16px 20px'}}>
                            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                              <button
                                style={{
                                  padding: '8px 12px',
                                  background: key.is_active ? '#fef3c7' : '#dcfce7',
                                  border: '1px solid ' + (key.is_active ? '#fcd34d' : '#86efac'),
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  color: key.is_active ? '#92400e' : '#166534',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => handleToggleActive(key)}
                                title={key.is_active ? 'Khóa key' : 'Kích hoạt key'}
                              >
                                <i className={`ri-${key.is_active ? 'lock' : 'unlock'}-line`}></i>
                              </button>
                              <button
                                style={{
                                  padding: '8px 12px',
                                  background: '#dbeafe',
                                  border: '1px solid #93c5fd',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  color: '#1e40af',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => openEditModal(key)}
                                title="Chỉnh sửa key"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                style={{
                                  padding: '8px 12px',
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  color: '#991b1b',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => handleDeleteKey(key.key_value)}
                                title="Xóa key"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="d-lg-none" style={{padding: '20px'}}>
                  {currentKeys.map((key) => (
                    <div key={key.key_value} style={{
                      background: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px'}}>
                        <div style={{flex: 1, minWidth: 0}}>
                          <code style={{
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            fontWeight: '600',
                            display: 'block',
                            wordBreak: 'break-all',
                            marginBottom: '6px'
                          }}>
                            {key.key_value}
                          </code>
                          {key.note && (
                            <small style={{color: '#64748b', fontSize: '0.7rem', display: 'block'}}>
                              {key.note}
                            </small>
                          )}
                        </div>
                        <button
                          style={{
                            padding: '8px',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#3b82f6',
                            marginLeft: '12px',
                            flexShrink: 0
                          }}
                          onClick={() => copyToClipboard(key.key_value)}
                        >
                          <i className="ri-file-copy-line"></i>
                        </button>
                      </div>

                      <div style={{display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'}}>
                        <span style={styles.badge('info')}>{getKeyTypeLabel(key.expired_at)}</span>
                        <span style={styles.badge(key.is_active ? 'success' : 'danger')}>
                          {key.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </div>

                      <div style={{fontSize: '0.75rem', color: '#64748b', marginBottom: '16px'}}>
                        <div style={{marginBottom: '4px'}}>
                          <strong>Ngày tạo:</strong> {formatDate(key.created_at)}
                        </div>
                        <div style={{marginBottom: '4px'}}>
                          <strong>Hết hạn:</strong> {formatDate(key.expired_at)}
                        </div>
                        {key.machine_name && (
                          <div><strong>Thiết bị:</strong> {key.machine_name}</div>
                        )}
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px'}}>
                        <button
                          style={{
                            padding: '10px',
                            background: key.is_active ? '#fef3c7' : '#dcfce7',
                            border: '1px solid ' + (key.is_active ? '#fcd34d' : '#86efac'),
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: key.is_active ? '#92400e' : '#166534',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}
                          onClick={() => handleToggleActive(key)}
                        >
                          <i className={`ri-${key.is_active ? 'lock' : 'unlock'}-line`}></i>
                        </button>
                        <button
                          style={{
                            padding: '10px',
                            background: '#dbeafe',
                            border: '1px solid #93c5fd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#1e40af',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}
                          onClick={() => openEditModal(key)}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          style={{
                            padding: '10px',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#991b1b',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}
                          onClick={() => handleDeleteKey(key.key_value)}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
                  Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredKeys.length)} trên {filteredKeys.length} key
                </div>
              </div>
            )}
          </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{padding: '32px 32px 24px', borderBottom: '1px solid #e5e7eb'}}>
              <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'}}>
                <i className="ri-add-circle-line" style={{color: '#3b82f6'}}></i>
                Tạo License Key mới
              </h3>
            </div>
            <form onSubmit={handleCreateKey} style={{padding: '32px'}}>
              <div style={{marginBottom: '24px'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                  <i className="ri-time-line me-1"></i>
                  Loại key
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <option value="trial">Dùng thử (7 ngày)</option>
                  <option value="month">Theo tháng (30 ngày)</option>
                  <option value="year">Theo năm (365 ngày)</option>
                  <option value="lifetime">Trọn đời</option>
                </select>
              </div>
              <div style={{marginBottom: '32px'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                  <i className="ri-sticky-note-line me-1"></i>
                  Ghi chú (không bắt buộc)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows="3"
                  placeholder="Thêm ghi chú nội bộ về key này..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1f2937',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1f2937',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.actionButton('primary'),
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: '1rem'
                  }}
                >
                  <i className="ri-check-line"></i>
                  Tạo key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedKey && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{padding: '32px 32px 24px', borderBottom: '1px solid #e5e7eb'}}>
              <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'}}>
                <i className="ri-edit-line" style={{color: '#3b82f6'}}></i>
                Chỉnh sửa License Key
              </h3>
            </div>
            <form onSubmit={handleUpdateKey} style={{padding: '32px'}}>
              <div style={{marginBottom: '24px'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                  <i className="ri-key-2-line me-1"></i>
                  Giá trị key
                </label>
                <input
                  type="text"
                  value={selectedKey.key_value}
                  disabled
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '0.875rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    color: '#6b7280',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <div style={{marginBottom: '24px'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                  <i className="ri-toggle-line me-1"></i>
                  Trạng thái
                </label>
                <select
                  value={selectedKey.is_active}
                  onChange={(e) => setSelectedKey({ ...selectedKey, is_active: e.target.value === 'true' })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Đã khóa</option>
                </select>
              </div>
              <div style={{marginBottom: '32px'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px'}}>
                  <i className="ri-sticky-note-line me-1"></i>
                  Ghi chú
                </label>
                <textarea
                  value={selectedKey.note || ''}
                  onChange={(e) => setSelectedKey({ ...selectedKey, note: e.target.value })}
                  rows="3"
                  placeholder="Thêm ghi chú nội bộ..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1f2937',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1f2937',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.actionButton('primary'),
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: '1rem'
                  }}
                >
                  <i className="ri-save-line"></i>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default KeyManagement;
