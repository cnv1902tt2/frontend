import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { keyAPI } from '../services/api';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const KeyManagement = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
      toast.error('Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await keyAPI.create(formData.type, formData.note);
      const newKey = response.data;
      
      // Insert new key at the beginning of the list (real-time)
      setKeys(prevKeys => [newKey, ...prevKeys]);
      
      toast.success('Key created successfully!');
      setShowCreateModal(false);
      setFormData({ type: 'trial', note: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create key');
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
      
      // Update key in list (real-time)
      setKeys(prevKeys => 
        prevKeys.map(key => 
          key.key_value === selectedKey.key_value ? updatedKey : key
        )
      );
      
      toast.success('Key updated successfully!');
      setShowEditModal(false);
      setSelectedKey(null);
    } catch (error) {
      toast.error('Failed to update key');
    }
  };

  const handleDeleteKey = async (keyValue) => {
    if (window.confirm('Are you sure you want to delete this key?')) {
      try {
        await keyAPI.delete(keyValue);
        
        // Remove key from list (real-time)
        setKeys(prevKeys => prevKeys.filter(key => key.key_value !== keyValue));
        
        toast.success('Key deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete key');
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
      
      // Update key in list (real-time)
      setKeys(prevKeys => 
        prevKeys.map(k => 
          k.key_value === key.key_value ? updatedKey : k
        )
      );
      
      toast.success(`Key ${!key.is_active ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      toast.error('Failed to update key status');
    }
  };

  const openEditModal = (key) => {
    setSelectedKey({ ...key });
    setShowEditModal(true);
  };

  const getKeyType = (expiredAt) => {
    if (!expiredAt) return 'lifetime';
    const daysDiff = Math.ceil((new Date(expiredAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return 'trial';
    if (daysDiff <= 35) return 'month';
    return 'year';
  };

  const getKeyTypeLabel = (expiredAt) => {
    if (!expiredAt) return 'Lifetime';
    const daysDiff = Math.ceil((new Date(expiredAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return 'Trial';
    if (daysDiff <= 35) return 'Monthly';
    return 'Yearly';
  };

  // Filter by tab
  const tabFilteredKeys = keys.filter((key) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return key.is_active;
    if (activeTab === 'inactive') return !key.is_active;
    return getKeyType(key.expired_at) === activeTab;
  });

  // Filter by search
  const filteredKeys = tabFilteredKeys.filter((key) =>
    key.key_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (key.note && key.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (key.machine_name && key.machine_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentKeys = filteredKeys.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Key copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy key');
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

  return (
    <div className="wrapper">
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
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="header-title">
                    <h4 className="card-title mb-0">Key Management</h4>
                  </div>
                  <button
                    className="btn btn-primary btn-sm d-md-none"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i className="las la-plus"></i>
                  </button>
                </div>
                <div className="card-body">
                  {/* Tabs */}
                  <ul className="nav nav-tabs mb-3 d-flex flex-nowrap" role="tablist" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>All</span>
                          <span className="badge badge-primary mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('all')}</span>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'trial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trial')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>Trial</span>
                          <span className="badge badge-secondary mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('trial')}</span>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'month' ? 'active' : ''}`}
                        onClick={() => setActiveTab('month')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>Month</span>
                          <span className="badge badge-secondary mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('month')}</span>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'year' ? 'active' : ''}`}
                        onClick={() => setActiveTab('year')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>Year</span>
                          <span className="badge badge-secondary mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('year')}</span>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'lifetime' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lifetime')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>Life</span>
                          <span className="badge badge-secondary mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('lifetime')}</span>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>On</span>
                          <span className="badge badge-success mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('active')}</span>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item flex-fill text-center">
                      <a
                        className={`nav-link ${activeTab === 'inactive' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inactive')}
                        style={{ cursor: 'pointer', padding: '0.5rem 0.25rem', fontSize: '0.875rem' }}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span>Off</span>
                          <span className="badge badge-danger mt-1" style={{ fontSize: '0.7rem' }}>{getTabCount('inactive')}</span>
                        </div>
                      </a>
                    </li>
                  </ul>

                  <div className="row justify-content-between mb-3">
                    <div className="col-12 col-md-6 mb-2 mb-md-0">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search keys..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6 d-none d-md-block">
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-primary"
                          onClick={() => setShowCreateModal(true)}
                        >
                          <i className="las la-plus mr-1"></i>Create New Key
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="table-responsive d-none d-lg-block">
                    <table className="table table-striped table-bordered mt-4">
                      <thead>
                        <tr>
                          <th>Key Value</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Expires</th>
                          <th>Machine</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                              </div>
                            </td>
                          </tr>
                        ) : currentKeys.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              No keys found
                            </td>
                          </tr>
                        ) : (
                          currentKeys.map((key) => (
                            <tr key={key.key_value}>
                              <td>
                                <div className="d-flex align-items-center justify-content-between">
                                  <div>
                                    <code className="text-primary">{key.key_value}</code>
                                    {key.note && (
                                      <><br /><small className="text-muted">{key.note}</small></>
                                    )}
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-primary ml-2"
                                    onClick={() => copyToClipboard(key.key_value)}
                                    title="Copy key"
                                    style={{ minWidth: '32px' }}
                                  >
                                    <i className="las la-copy"></i>
                                  </button>
                                </div>
                              </td>
                              <td>
                                <span className="badge badge-info">
                                  {getKeyTypeLabel(key.expired_at)}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${key.is_active ? 'badge-success' : 'badge-danger'}`}>
                                  {key.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td><small>{formatDate(key.created_at)}</small></td>
                              <td><small>{formatDate(key.expired_at)}</small></td>
                              <td>
                                <small>
                                  {key.machine_name || 'N/A'}
                                  {key.os_version && <><br />OS: {key.os_version}</>}
                                  {key.revit_version && <><br />Revit: {key.revit_version}</>}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    className={`btn ${key.is_active ? 'btn-warning' : 'btn-success'}`}
                                    onClick={() => handleToggleActive(key)}
                                    title={key.is_active ? 'Deactivate' : 'Activate'}
                                  >
                                    <i className={`las ${key.is_active ? 'la-lock' : 'la-unlock'}`}></i>
                                  </button>
                                  <button
                                    className="btn btn-info"
                                    onClick={() => openEditModal(key)}
                                    title="Edit"
                                  >
                                    <i className="las la-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteKey(key.key_value)}
                                    title="Delete"
                                  >
                                    <i className="las la-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-lg-none">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    ) : currentKeys.length === 0 ? (
                      <div className="alert alert-info text-center">No keys found</div>
                    ) : (
                      currentKeys.map((key) => (
                        <div key={key.key_value} className="card mb-3">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <code className="text-primary d-block mb-1" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                                  {key.key_value}
                                </code>
                                {key.note && <small className="text-muted d-block">{key.note}</small>}
                              </div>
                              <button
                                className="btn btn-sm btn-outline-primary ml-2"
                                onClick={() => copyToClipboard(key.key_value)}
                              >
                                <i className="las la-copy"></i>
                              </button>
                            </div>
                            
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <span className="badge badge-info">{getKeyTypeLabel(key.expired_at)}</span>
                              <span className={`badge ${key.is_active ? 'badge-success' : 'badge-danger'}`}>
                                {key.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <div className="small text-muted mb-2">
                              <div><strong>Created:</strong> {formatDate(key.created_at)}</div>
                              <div><strong>Expires:</strong> {formatDate(key.expired_at)}</div>
                              {key.machine_name && (
                                <div><strong>Machine:</strong> {key.machine_name}</div>
                              )}
                            </div>

                            <div className="d-flex" style={{ gap: '0.5rem' }}>
                              <button
                                className={`btn btn-sm ${key.is_active ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => handleToggleActive(key)}
                                style={{ flex: '1', minWidth: '0' }}
                                title={key.is_active ? 'Lock' : 'Unlock'}
                              >
                                <i className={`las ${key.is_active ? 'la-lock' : 'la-unlock'}`}></i>
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => openEditModal(key)}
                                style={{ flex: '1', minWidth: '0' }}
                                title="Edit"
                              >
                                <i className="las la-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteKey(key.key_value)}
                                style={{ flex: '1', minWidth: '0' }}
                                title="Delete"
                              >
                                <i className="las la-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <nav>
                          <ul className="pagination justify-content-center flex-wrap">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => {
                              const pageNumber = index + 1;
                              // Show first page, last page, current page, and pages around current
                              if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                              ) {
                                return (
                                  <li
                                    key={pageNumber}
                                    className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                  >
                                    <button
                                      className="page-link"
                                      onClick={() => paginate(pageNumber)}
                                    >
                                      {pageNumber}
                                    </button>
                                  </li>
                                );
                              } else if (
                                pageNumber === currentPage - 2 ||
                                pageNumber === currentPage + 2
                              ) {
                                return (
                                  <li key={pageNumber} className="page-item disabled">
                                    <span className="page-link">...</span>
                                  </li>
                                );
                              }
                              return null;
                            })}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                        <div className="text-center text-muted small">
                          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredKeys.length)} of {filteredKeys.length} entries
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Key</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowCreateModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleCreateKey}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Key Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      <option value="trial">Trial (7 days)</option>
                      <option value="month">Monthly (30 days)</option>
                      <option value="year">Yearly (365 days)</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Note (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Add internal note..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Key Modal */}
      {showEditModal && selectedKey && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Key</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowEditModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpdateKey}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Key Value</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedKey.key_value}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={selectedKey.is_active}
                      onChange={(e) =>
                        setSelectedKey({ ...selectedKey, is_active: e.target.value === 'true' })
                      }
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Note</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={selectedKey.note || ''}
                      onChange={(e) =>
                        setSelectedKey({ ...selectedKey, note: e.target.value })
                      }
                      placeholder="Add internal note..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyManagement;
