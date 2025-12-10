import React, { useState, useEffect } from 'react';
import { downloadService } from '../services/downloadService';

const Downloads = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  
  const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO || 'chuongbom/SimpleBIM';

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await downloadService.getActiveVersions();
      const sorted = data.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      setVersions(sorted);
    } catch (err) {
      console.error('Failed to load versions:', err);
      setError('Không thể tải danh sách phiên bản. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const handleDownload = async (version) => {
    try {
      await downloadService.trackDownload(version.id, GITHUB_REPO);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const downloadUrl = `${API_BASE_URL}/updates/versions/${version.id}/download?github_repo=${encodeURIComponent(GITHUB_REPO)}`;
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Error tracking download:', err);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const downloadUrl = `${API_BASE_URL}/updates/versions/${version.id}/download?github_repo=${encodeURIComponent(GITHUB_REPO)}`;
      window.open(downloadUrl, '_blank');
    }
  };

  const getUpdateTypeBadge = (type) => {
    const configs = {
      mandatory: { label: 'Bắt buộc', color: '#ef4444' },
      recommended: { label: 'Khuyến nghị', color: '#f59e0b' },
      optional: { label: 'Tùy chọn', color: '#3b82f6' }
    };
    return configs[type] || configs.optional;
  };

  const filteredVersions = filterType === 'all' 
    ? versions 
    : versions.filter(v => v.update_type === filterType);

  const isLatestVersion = (version, allVersions) => {
    return allVersions.length > 0 && version.id === allVersions[0].id;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      paddingBottom: '40px'
    },
    header: {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      padding: '60px 20px',
      textAlign: 'center'
    },
    headerIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)'
    },
    headerTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '16px',
      margin: 0,
      color: '#ffffffff'
    },
    headerSubtitle: {
      fontSize: '1.25rem',
      color: '#ffffffff',
      margin: 0
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      marginTop: '-50px'
    },
    warningCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '32px',
      border: '2px solid #93c5fd'
    },
    warningHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    },
    warningIcon: {
      width: '48px',
      height: '48px',
      backgroundColor: '#dbeafe',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    warningTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    warningText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '16px',
      lineHeight: '1.6'
    },
    warningSteps: {
      backgroundColor: '#eff6ff',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '16px'
    },
    guideBox: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '32px',
      border: '1px solid #fbbf24'
    },
    guideTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#92400e',
      marginBottom: '16px'
    },
    guideStep: {
      display: 'flex',
      gap: '12px',
      marginBottom: '12px',
      color: '#92400e',
      fontSize: '0.875rem',
      alignItems: 'center'
    },
    filterContainer: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '8px',
      marginBottom: '32px',
      display: 'inline-flex',
      gap: '8px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '10px 24px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '500',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: 'transparent',
      color: '#6b7280'
    },
    filterButtonActive: {
      backgroundColor: '#6366f1',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },
    versionCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      marginBottom: '16px',
      border: '1px solid #f3f4f6',
      overflow: 'hidden',
      transition: 'all 0.3s'
    },
    versionCardHover: {
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
      transform: 'translateY(-4px)'
    },
    cardContent: {
      padding: '24px'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    versionTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 8px 0'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginRight: '8px'
    },
    badgeLatest: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    badgeForce: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    updateTypeBadge: (color) => ({
      padding: '8px 16px',
      borderRadius: '12px',
      backgroundColor: color,
      color: '#fff',
      fontSize: '0.875rem',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    }),
    metadata: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '16px'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    description: {
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '16px'
    },
    expandedContent: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6'
    },
    noteItem: {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6'
    },
    statBox: {
      textAlign: 'left'
    },
    statLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#9ca3af',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    checksumBox: {
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px'
    },
    checksumLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#9ca3af',
      marginBottom: '8px'
    },
    checksumCode: {
      fontSize: '0.75rem',
      color: '#6b7280',
      wordBreak: 'break-all',
      fontFamily: '"Courier New", monospace',
      lineHeight: '1.5'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      flexWrap: 'wrap'
    },
    downloadButton: {
      flex: '1',
      minWidth: '200px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      padding: '14px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    detailButton: {
      padding: '14px 24px',
      border: '2px solid #e5e7eb',
      backgroundColor: 'transparent',
      color: '#4b5563',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '80px 20px'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #e0e7ff',
      borderTopColor: '#6366f1',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '2px solid #fca5a5',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '32px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px'
    },
    emptyIcon: {
      width: '80px',
      height: '80px',
      backgroundColor: '#f3f4f6',
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    footer: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid #e5e7eb',
      padding: '32px 20px',
      marginTop: '48px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          button:hover {
            opacity: 0.9;
            transform: translateY(-2px);
          }
          button:active {
            transform: translateY(0);
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <i className="ri-download-cloud-line" style={{fontSize: '2.5rem'}}></i>
        </div>
        <h1 style={styles.headerTitle}>SimpleBIM</h1>
        <p style={{...styles.headerSubtitle, marginTop: '16px'}}>Tải xuống phiên bản mới nhất</p>
      </div>

      <div style={styles.content}>
        {/* Warning Card */}
        <div style={styles.warningCard}>
          <div style={styles.warningHeader}>
            <div style={styles.warningIcon}>
              <i className="ri-shield-check-line" style={{fontSize: '1.5rem', color: '#3b82f6'}}></i>
            </div>
            <div style={{flex: 1}}>
              <h3 style={styles.warningTitle}>Gặp cảnh báo bảo mật Windows?</h3>
              <p style={styles.warningText}>
                Đây là cảnh báo bình thường của Microsoft SmartScreen. Phần mềm hoàn toàn an toàn.
              </p>
              <div style={styles.warningSteps}>
                <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '8px'}}>
                  Cách vượt qua:
                </p>
                <ol style={{margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#1e40af'}}>
                  <li>Click <strong>"More info"</strong></li>
                  <li>Click <strong>"Run anyway"</strong></li>
                  <li>Tiếp tục cài đặt bình thường</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Box */}
        <div style={styles.guideBox}>
          <div style={styles.guideTitle}>
            <i className="ri-information-line"></i>
            <span>Hướng dẫn nhanh</span>
          </div>
          <div style={styles.guideStep}>
            <span style={{fontSize: '1.5rem'}}>1️⃣</span>
            <span><strong>Lần đầu:</strong> Tải ZIP → Giải nén → Chạy <code style={{background: '#fff', padding: '2px 6px', borderRadius: '4px'}}>Installer.exe</code></span>
          </div>
          <div style={styles.guideStep}>
            <span style={{fontSize: '1.5rem'}}>2️⃣</span>
            <span><strong>Đã cài:</strong> Tải ZIP mới → Revit tự động cập nhật</span>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterContainer}>
          <button
            style={{...styles.filterButton, ...(filterType === 'all' ? styles.filterButtonActive : {})}}
            onClick={() => setFilterType('all')}
          >
            Tất cả
          </button>
          <button
            style={{...styles.filterButton, ...(filterType === 'mandatory' ? {...styles.filterButtonActive, backgroundColor: '#ef4444'} : {})}}
            onClick={() => setFilterType('mandatory')}
          >
            Bắt buộc
          </button>
          <button
            style={{...styles.filterButton, ...(filterType === 'recommended' ? {...styles.filterButtonActive, backgroundColor: '#f59e0b'} : {})}}
            onClick={() => setFilterType('recommended')}
          >
            Khuyến nghị
          </button>
          <button
            style={{...styles.filterButton, ...(filterType === 'optional' ? {...styles.filterButtonActive, backgroundColor: '#3b82f6'} : {})}}
            onClick={() => setFilterType('optional')}
          >
            Tùy chọn
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{color: '#9ca3af'}}>Đang tải danh sách phiên bản...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={styles.errorBox}>
            <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
              <i className="ri-error-warning-line" style={{fontSize: '1.5rem', color: '#dc2626'}}></i>
              <div style={{flex: 1}}>
                <h3 style={{color: '#991b1b', fontWeight: '600', marginBottom: '4px'}}>Đã có lỗi xảy ra</h3>
                <p style={{color: '#dc2626', fontSize: '0.875rem', margin: 0}}>{error}</p>
              </div>
              <button onClick={() => setError('')} style={{background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem'}}>×</button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVersions.length === 0 && !error && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <i className="ri-inbox-line" style={{fontSize: '2.5rem', color: '#9ca3af'}}></i>
            </div>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>
              Không tìm thấy phiên bản
            </h3>
            <p style={{color: '#9ca3af', marginBottom: '24px'}}>
              Không có phiên bản nào phù hợp với bộ lọc này
            </p>
            {filterType !== 'all' && (
              <button
                onClick={() => setFilterType('all')}
                style={{...styles.downloadButton, width: 'auto'}}
              >
                Xem tất cả phiên bản
              </button>
            )}
          </div>
        )}

        {/* Version Cards */}
        {!loading && filteredVersions.map((version) => {
          const badge = getUpdateTypeBadge(version.update_type);
          const isExpanded = expandedCard === version.id;
          const isLatest = isLatestVersion(version, versions);

          return (
            <div
              key={version.id}
              style={styles.versionCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.versionCardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <div style={{flex: 1, minWidth: '200px'}}>
                    <h2 style={styles.versionTitle}>v{version.version}</h2>
                    <div style={{marginBottom: '8px'}}>
                      {isLatest && (
                        <span style={{...styles.badge, ...styles.badgeLatest}}>
                          <i className="ri-star-fill"></i>
                          Mới nhất
                        </span>
                      )}
                      {version.force_update && (
                        <span style={{...styles.badge, ...styles.badgeForce}}>
                          <i className="ri-alert-fill"></i>
                          Bắt buộc cập nhật
                        </span>
                      )}
                    </div>
                    <div style={styles.metadata}>
                      <span style={styles.metaItem}>
                        <i className="ri-calendar-line"></i>
                        {formatDate(version.release_date)}
                      </span>
                      <span style={styles.metaItem}>
                        <i className="ri-file-zip-line"></i>
                        {formatFileSize(version.file_size)}
                      </span>
                    </div>
                  </div>
                  <span style={styles.updateTypeBadge(badge.color)}>
                    {badge.label}
                  </span>
                </div>

                {version.release_notes && (
                  <p style={styles.description}>
                    {version.release_notes.split('\n')[0]}
                  </p>
                )}

                {isExpanded && version.release_notes && (
                  <div style={styles.expandedContent}>
                    {version.release_notes.split('\n').slice(1).map((note, i) => (
                      note && (
                        <div key={i} style={styles.noteItem}>
                          <span style={{color: '#6366f1'}}>•</span>
                          <span>{note}</span>
                        </div>
                      )
                    ))}

                    <div style={styles.statsGrid}>
                      <div style={styles.statBox}>
                        <div style={styles.statLabel}>Lượt tải</div>
                        <div style={styles.statValue}>
                          {(version.download_count || 0).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={styles.statLabel}>Lượt cài đặt</div>
                        <div style={styles.statValue}>
                          {(version.install_count || 0).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    {version.checksum_sha256 && (
                      <div style={styles.checksumBox}>
                        <div style={styles.checksumLabel}>SHA256 Checksum</div>
                        <code style={styles.checksumCode}>
                          {version.checksum_sha256}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => handleDownload(version)}
                    style={styles.downloadButton}
                  >
                    <i className="ri-download-cloud-line" style={{fontSize: '1.25rem'}}></i>
                    <span>Tải xuống</span>
                  </button>
                  {version.release_notes && version.release_notes.split('\n').length > 1 && (
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : version.id)}
                      style={styles.detailButton}
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                      <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line`}></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{color: '#6b7280', marginBottom: '8px'}}>
          Cảm ơn bạn đã sử dụng SimpleBIM
        </p>
        <p style={{fontSize: '0.875rem', color: '#9ca3af', margin: 0}}>
          Cần hỗ trợ? <a href="mailto:support@simplebim.com" style={{color: '#6366f1', textDecoration: 'none'}}>Liên hệ với chúng tôi</a>
        </p>
      </div>
    </div>
  );
};

export default Downloads;