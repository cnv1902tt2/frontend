import React, { useState, useEffect } from 'react';
import { downloadService } from '../services/downloadService';

// --- CSS Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    paddingTop: '60px',
    paddingBottom: '40px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  headerTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  headerSubtitle: {
    fontSize: '1.3rem',
    opacity: '0.95'
  },
  versionCard: {
    background: '#fff',
    borderRadius: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    marginBottom: '30px',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  versionCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  versionHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeRecommended: {
    background: '#ffc107',
    color: '#000',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginRight: '10px'
  },
  badgeLatest: {
    background: '#28a745',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  versionBody: {
    padding: '30px'
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '1.1rem',
    color: '#333',
    fontWeight: '500'
  },
  updateTypeIcon: (type) => {
    let colors = { optional: '#17a2b8', recommended: '#ffc107', mandatory: '#dc3545' };
    return {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      backgroundColor: colors[type] + '20',
      color: colors[type],
      fontWeight: '600',
      fontSize: '0.9rem',
      border: `2px solid ${colors[type]}`
    };
  },
  releaseNotes: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    borderLeft: '4px solid #667eea',
    marginBottom: '25px',
    lineHeight: '1.6'
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '15px 40px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px'
  },
  downloadButtonHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
  },
  filterContainer: {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '40px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999'
  }
};

const Downloads = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await downloadService.getActiveVersions();
      // Sort by release_date descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      setVersions(sorted);
    } catch (err) {
      console.error('Failed to load versions:', err);
      setError('Không thể tải danh sách phiên bản. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (version) => {
    try {
      await downloadService.trackDownload(version.id);
      window.open(version.download_url, '_blank');
    } catch (err) {
      console.error('Error tracking download:', err);
      window.open(version.download_url, '_blank');
    }
  };

  const filteredVersions = filterType === 'all' 
    ? versions 
    : versions.filter(v => v.update_type === filterType);

  const isLatestVersion = (version, allVersions) => {
    return allVersions.length > 0 && version.id === allVersions[0].id;
  };

  const getUpdateTypeLabel = (type) => {
    const labels = {
      optional: 'Tùy chọn',
      recommended: 'Khuyến nghị',
      mandatory: 'Bắt buộc'
    };
    return labels[type] || type;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} className="mb-5">
        <div className="container">
          <h1 style={styles.headerTitle}>
            <i className="ri-download-cloud-2-line me-3"></i>
            Tải xuống SimpleBIM
          </h1>
          <p style={styles.headerSubtitle}>Chọn phiên bản phù hợp để tải xuống và cài đặt</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div style={styles.filterContainer}>
          <label className="fw-semibold me-3" style={{marginBottom: 0}}>Lọc theo loại cập nhật:</label>
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả phiên bản
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'mandatory' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setFilterType('mandatory')}
            >
              Bắt buộc
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'recommended' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilterType('recommended')}
            >
              Khuyến nghị
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'optional' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setFilterType('optional')}
            >
              Tùy chọn
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-muted">Đang tải danh sách phiên bản...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="ri-error-warning-line me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* No Versions */}
        {!loading && filteredVersions.length === 0 && !error && (
          <div style={styles.emptyState}>
            <i className="ri-inbox-line" style={{fontSize: '3rem', display: 'block', marginBottom: '15px'}}></i>
            <p style={{fontSize: '1.2rem'}}>Không có phiên bản nào khả dụng cho bộ lọc này.</p>
            {filterType !== 'all' && (
              <button 
                className="btn btn-outline-primary mt-3"
                onClick={() => setFilterType('all')}
              >
                <i className="ri-refresh-line me-2"></i>
                Xem tất cả phiên bản
              </button>
            )}
          </div>
        )}

        {/* Version Cards */}
        {!loading && filteredVersions.map((version, index) => (
          <div
            key={version.id}
            style={{
              ...styles.versionCard,
              ...(hoveredCard === version.id ? styles.versionCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(version.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Card Header */}
            <div style={styles.versionHeader}>
              <div>
                <h2 style={{margin: '0 0 10px 0', fontSize: '2rem'}}>
                  v{version.version}
                </h2>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                  <span style={styles.updateTypeIcon(version.update_type)}>
                    {getUpdateTypeLabel(version.update_type)}
                  </span>
                  {version.force_update && (
                    <span style={{...styles.badgeLatest, background: '#e74c3c'}}>
                      <i className="ri-alert-fill me-1"></i>Bắt buộc cập nhật
                    </span>
                  )}
                  {isLatestVersion(version, versions) && (
                    <span style={styles.badgeLatest}>
                      <i className="ri-star-fill me-1"></i>Mới nhất
                    </span>
                  )}
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.9rem', opacity: '0.9', marginBottom: '10px'}}>
                  <i className="ri-calendar-line me-2"></i>
                  {formatDate(version.release_date)}
                </div>
                <div style={{fontSize: '1.1rem', fontWeight: '600'}}>
                  <i className="ri-file-zip-line me-2"></i>
                  {formatFileSize(version.file_size)}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div style={styles.versionBody}>
              {/* Info Grid */}
              <div style={styles.infoRow}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>
                    <i className="ri-download-line me-2"></i>Lượt tải
                  </div>
                  <div style={styles.infoValue}>
                    {(version.download_count || 0).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>
                    <i className="ri-check-line me-2"></i>Lượt cài đặt
                  </div>
                  <div style={styles.infoValue}>
                    {(version.install_count || 0).toLocaleString('vi-VN')}
                  </div>
                </div>
                {version.min_required_version && (
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>
                      <i className="ri-git-commit-line me-2"></i>Phiên bản tối thiểu
                    </div>
                    <div style={styles.infoValue}>v{version.min_required_version}</div>
                  </div>
                )}
              </div>

              {/* Release Notes */}
              {version.release_notes && (
                <div style={styles.releaseNotes}>
                  <h5 style={{marginBottom: '15px', color: '#333', fontWeight: '600'}}>
                    <i className="ri-file-text-line me-2"></i>Ghi chú phát hành
                  </h5>
                  <div style={{whiteSpace: 'pre-wrap', color: '#555', fontSize: '0.95rem'}}>
                    {version.release_notes}
                  </div>
                </div>
              )}

              {/* Info Display */}
              {version.checksum_sha256 && (
                <div style={{marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
                  <div style={styles.infoLabel} className="mb-2">
                    <i className="ri-fingerprint-line me-2"></i>SHA256 Checksum
                  </div>
                  <code style={{
                    display: 'block',
                    padding: '10px',
                    background: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6',
                    fontSize: '0.85rem',
                    color: '#495057',
                    wordBreak: 'break-all',
                    fontFamily: "'Courier New', monospace"
                  }}>
                    {version.checksum_sha256}
                  </code>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={() => handleDownload(version)}
                style={styles.downloadButton}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.downloadButtonHover)}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="ri-download-cloud-line" style={{fontSize: '1.3rem'}}></i>
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{background: 'rgba(0,0,0,0.05)', padding: '40px 20px', marginTop: '60px', textAlign: 'center', color: '#666'}}>
        <p style={{marginBottom: '10px'}}>
          <i className="ri-information-line me-2"></i>
          Chọn phiên bản phù hợp để tải xuống. Cảm ơn bạn đã sử dụng SimpleBIM!
        </p>
        <p style={{fontSize: '0.9rem', marginBottom: '0'}}>
          Có câu hỏi? <a href="mailto:support@simplebim.com" style={{color: '#667eea', textDecoration: 'none'}}>Liên hệ với chúng tôi</a>
        </p>
      </div>
    </div>
  );
};

export default Downloads;
