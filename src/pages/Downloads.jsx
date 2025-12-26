import React, { useState, useEffect } from 'react';
import { downloadService } from '../services/downloadService';

// Refactor: Clean design, no gradients/shadows, mobile-first
const Downloads = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = parseInt(process.env.REACT_APP_ITEMS_PER_PAGE) || 10;

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
      await downloadService.trackDownload(version.id);
      
      if (version.download_url) {
        window.open(version.download_url, '_blank');
      } else {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        window.open(`${API_BASE_URL}/updates/versions/${version.id}/download`, '_blank');
      }
    } catch (err) {
      console.error('Error tracking download:', err);
      if (version.download_url) {
        window.open(version.download_url, '_blank');
      }
    }
  };

  const getUpdateTypeBadge = (type) => {
    const configs = {
      mandatory: { label: 'Bắt buộc', bg: '#fee2e2', color: '#991b1b' },
      recommended: { label: 'Khuyến nghị', bg: '#fef3c7', color: '#92400e' },
      optional: { label: 'Tùy chọn', bg: '#e0f2fe', color: '#0369a1' }
    };
    return configs[type] || configs.optional;
  };

  const filteredVersions = filterType === 'all' 
    ? versions 
    : versions.filter(v => v.update_type === filterType);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVersions = filteredVersions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVersions.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset page when filter changes
  const handleFilterChange = (filter) => {
    setFilterType(filter);
    setCurrentPage(1);
  };

  const isLatestVersion = (version, allVersions) => {
    return allVersions.length > 0 && version.id === allVersions[0].id;
  };

  // Clean styles - no gradients, minimal shadows
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      paddingBottom: '40px',
    },
    header: {
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
      padding: '48px 16px',
      textAlign: 'center',
    },
    headerIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '64px',
      height: '64px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      marginBottom: '16px',
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '8px',
      margin: 0,
      color: '#FFFFFF',
    },
    headerSubtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      margin: 0,
      marginTop: '8px',
    },
    content: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 16px',
      marginTop: '-24px',
    },
    infoCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '20px',
      marginBottom: '24px',
    },
    infoHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    infoIcon: {
      width: '40px',
      height: '40px',
      backgroundColor: '#e0f2fe',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    infoTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px',
      margin: 0,
    },
    infoText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '12px',
      lineHeight: '1.5',
      margin: 0,
      marginTop: '4px',
    },
    infoSteps: {
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      padding: '12px 16px',
      marginTop: '12px',
    },
    guideCard: {
      backgroundColor: '#fffbeb',
      borderRadius: '8px',
      border: '1px solid #fde68a',
      padding: '16px 20px',
      marginBottom: '24px',
    },
    guideTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9375rem',
      fontWeight: '600',
      color: '#92400e',
      marginBottom: '12px',
    },
    guideStep: {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px',
      color: '#92400e',
      fontSize: '0.875rem',
      alignItems: 'center',
    },
    filterContainer: {
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      padding: '4px',
      marginBottom: '24px',
      display: 'inline-flex',
      gap: '4px',
      flexWrap: 'wrap',
      border: '1px solid #e5e7eb',
    },
    filterButton: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      fontWeight: '500',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      backgroundColor: 'transparent',
      color: '#6b7280',
    },
    filterButtonActive: {
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
    },
    versionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    },
    cardContent: {
      padding: '20px',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    versionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0 0 6px 0',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginRight: '6px',
    },
    badgeLatest: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    badgeForce: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    updateTypeBadge: (bg, color) => ({
      padding: '6px 12px',
      borderRadius: '4px',
      backgroundColor: bg,
      color: color,
      fontSize: '0.8125rem',
      fontWeight: '600',
      whiteSpace: 'nowrap',
    }),
    metadata: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '12px',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    description: {
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '12px',
      fontSize: '0.9375rem',
    },
    expandedContent: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    noteItem: {
      display: 'flex',
      gap: '8px',
      marginBottom: '6px',
      fontSize: '0.875rem',
      color: '#4b5563',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    statBox: {
      textAlign: 'left',
    },
    statLabel: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#9ca3af',
      marginBottom: '2px',
    },
    statValue: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937',
    },
    checksumBox: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
    },
    checksumLabel: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '4px',
    },
    checksumCode: {
      fontSize: '0.75rem',
      color: '#4b5563',
      wordBreak: 'break-all',
      fontFamily: 'monospace',
      lineHeight: '1.5',
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      flexWrap: 'wrap',
    },
    downloadButton: {
      flex: '1',
      minWidth: '160px',
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
      padding: '12px 20px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.9375rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
    },
    detailButton: {
      padding: '12px 20px',
      border: '1px solid #d1d5db',
      backgroundColor: '#FFFFFF',
      color: '#4b5563',
      borderRadius: '6px',
      fontSize: '0.9375rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'background-color 0.2s',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '60px 16px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto 16px',
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fca5a5',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 16px',
    },
    emptyIcon: {
      width: '64px',
      height: '64px',
      backgroundColor: '#f3f4f6',
      borderRadius: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    footer: {
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      padding: '24px 16px',
      marginTop: '48px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}
      </style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerIcon}>
          <i className="ri-download-cloud-line" style={{ fontSize: '2rem' }}></i>
        </div>
        <h1 style={styles.headerTitle}>SimpleBIM</h1>
        <p style={styles.headerSubtitle}>Tải xuống phiên bản mới nhất</p>
      </header>

      <div style={styles.content}>
        {/* Info Card */}
        <div style={styles.infoCard}>
          <div style={styles.infoHeader}>
            <div style={styles.infoIcon}>
              <i className="ri-shield-check-line" style={{ fontSize: '1.25rem', color: '#3b82f6' }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={styles.infoTitle}>Gặp cảnh báo bảo mật Windows?</h3>
              <p style={styles.infoText}>
                Đây là cảnh báo bình thường của Microsoft SmartScreen. Phần mềm hoàn toàn an toàn.
              </p>
              <div style={styles.infoSteps}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '6px', margin: 0 }}>
                  Cách vượt qua:
                </p>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#4b5563' }}>
                  <li>Click <strong>"More info"</strong></li>
                  <li>Click <strong>"Run anyway"</strong></li>
                  <li>Tiếp tục cài đặt bình thường</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Card */}
        <div style={styles.guideCard}>
          <div style={styles.guideTitle}>
            <i className="ri-information-line"></i>
            <span>Hướng dẫn nhanh</span>
          </div>
          <div style={styles.guideStep}>
            <span>1️⃣</span>
            <span><strong>Lần đầu:</strong> Tải ZIP → Giải nén → Chạy <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>Installer.exe</code></span>
          </div>
          <div style={styles.guideStep}>
            <span>2️⃣</span>
            <span><strong>Đã cài:</strong> Tải ZIP mới → Revit tự động cập nhật</span>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterContainer}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'mandatory', label: 'Bắt buộc' },
            { key: 'recommended', label: 'Khuyến nghị' },
            { key: 'optional', label: 'Tùy chọn' },
          ].map((filter) => (
            <button
              key={filter.key}
              style={{
                ...styles.filterButton,
                ...(filterType === filter.key ? styles.filterButtonActive : {}),
              }}
              onClick={() => handleFilterChange(filter.key)}
              aria-pressed={filterType === filter.key}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#6b7280', margin: 0 }}>Đang tải danh sách phiên bản...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={styles.errorBox} role="alert">
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <i className="ri-error-warning-line" style={{ fontSize: '1.25rem', color: '#dc2626' }}></i>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#991b1b', fontWeight: '600', marginBottom: '4px', margin: 0 }}>Đã có lỗi xảy ra</h3>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0, marginTop: '4px' }}>{error}</p>
              </div>
              <button 
                onClick={() => setError('')} 
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem', padding: '0' }}
                aria-label="Đóng thông báo lỗi"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVersions.length === 0 && !error && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <i className="ri-inbox-line" style={{ fontSize: '2rem', color: '#9ca3af' }}></i>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Không tìm thấy phiên bản
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Không có phiên bản nào phù hợp với bộ lọc này
            </p>
            {filterType !== 'all' && (
              <button
                onClick={() => setFilterType('all')}
                style={{ ...styles.downloadButton, width: 'auto', display: 'inline-flex' }}
              >
                Xem tất cả phiên bản
              </button>
            )}
          </div>
        )}

        {/* Version Cards */}
        {!loading && currentVersions.map((version) => {
          const badge = getUpdateTypeBadge(version.update_type);
          const isExpanded = expandedCard === version.id;
          const isLatest = isLatestVersion(version, versions);

          return (
            <article
              key={version.id}
              style={styles.versionCard}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h2 style={styles.versionTitle}>v{version.version}</h2>
                    <div style={{ marginBottom: '8px' }}>
                      {isLatest && (
                        <span style={{ ...styles.badge, ...styles.badgeLatest }}>
                          <i className="ri-star-fill"></i>
                          Mới nhất
                        </span>
                      )}
                      {version.force_update && (
                        <span style={{ ...styles.badge, ...styles.badgeForce }}>
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
                  <span style={styles.updateTypeBadge(badge.bg, badge.color)}>
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
                          <span style={{ color: '#3b82f6' }}>•</span>
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
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    <i className="ri-download-cloud-line" style={{ fontSize: '1.125rem' }}></i>
                    <span>Tải xuống</span>
                  </button>
                  {version.release_notes && version.release_notes.split('\n').length > 1 && (
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : version.id)}
                      style={styles.detailButton}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                      <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line`}></i>
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginTop: '24px'
          }}>
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
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredVersions.length)} trên {filteredVersions.length} phiên bản
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ color: '#6b7280', marginBottom: '8px', margin: 0 }}>
          Cảm ơn bạn đã sử dụng SimpleBIM
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, marginTop: '8px' }}>
          Cần hỗ trợ? <a href="mailto:support@simplebim.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>Liên hệ với chúng tôi</a>
        </p>
      </footer>
    </div>
  );
};

export default Downloads;