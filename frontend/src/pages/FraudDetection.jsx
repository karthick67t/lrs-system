import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaShieldAlt, FaBan, FaCheck, FaRedo, FaEye, FaSearch, FaTimes, FaExclamationTriangle, FaUserSecret, FaHistory, FaCheckCircle, FaLock } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { StatCardSkeleton, TableRowSkeleton } from '../components/SkeletonLoader';

export const FraudDetection = () => {
  const [fraudRecords, setFraudRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters State
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedFraud, setSelectedFraud] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  const loadFraud = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/fraud');
      setFraudRecords(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load fraud risk alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFraud();
  }, []);

  const handleUpdateStatus = async (fraudId, newStatus) => {
    setActionProcessing(true);
    setError('');
    setSuccess('');
    try {
      let endpoint = `/api/fraud/${fraudId}/status`;
      if (newStatus === 'UNDER_REVIEW') endpoint = `/api/fraud/${fraudId}/review`;
      else if (newStatus === 'CONFIRMED') endpoint = `/api/fraud/${fraudId}/confirm`;
      else if (newStatus === 'FALSE_POSITIVE') endpoint = `/api/fraud/${fraudId}/false-positive`;
      else if (newStatus === 'BLOCKED') endpoint = `/api/fraud/${fraudId}/block`;
      else if (newStatus === 'RESOLVED') endpoint = `/api/fraud/${fraudId}/resolve`;

      const updated = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      setSuccess(`Fraud record #${fraudId} status updated to ${newStatus}.`);
      if (selectedFraud && selectedFraud.fraudId === fraudId) {
        setSelectedFraud(updated);
      }
      loadFraud();
    } catch (err) {
      setError(err.message || 'Failed to update fraud alert status.');
    } finally {
      setActionProcessing(false);
    }
  };

  const filteredRecords = fraudRecords.filter((f) => {
    const matchesRisk = riskFilter === 'ALL' || f.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (f.customerName && f.customerName.toLowerCase().includes(q)) ||
      (f.fraudId && f.fraudId.toString().includes(q)) ||
      (f.detectedRules && f.detectedRules.toLowerCase().includes(q));
    return matchesRisk && matchesStatus && matchesSearch;
  });

  const totalAlerts = fraudRecords.length;
  const openAlerts = fraudRecords.filter(f => f.status === 'OPEN').length;
  const highRiskCount = fraudRecords.filter(f => f.riskLevel === 'HIGH').length;
  const medRiskCount = fraudRecords.filter(f => f.riskLevel === 'MEDIUM').length;
  const lowRiskCount = fraudRecords.filter(f => f.riskLevel === 'LOW').length;
  const blockedCount = fraudRecords.filter(f => f.status === 'BLOCKED').length;

  const renderRiskBadge = (level, score) => {
    let cls = 'badge-active';
    if (level === 'HIGH') cls = 'badge-inactive';
    else if (level === 'MEDIUM') cls = 'badge-gold';
    return (
      <span className={`badge ${cls}`} style={{ fontWeight: 800 }}>
        <span className="badge-dot"></span>{level} ({score}/100)
      </span>
    );
  };

  const renderStatusBadge = (st) => {
    let cls = 'badge-role';
    if (st === 'BLOCKED' || st === 'CONFIRMED') cls = 'badge-inactive';
    else if (st === 'OPEN') cls = 'badge-active';
    else if (st === 'UNDER_REVIEW') cls = 'badge-gold';
    else if (st === 'RESOLVED' || st === 'FALSE_POSITIVE') cls = 'badge-silver';

    return <span className={`badge ${cls}`}>{st}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaShieldAlt style={{ color: 'var(--primary)' }} />
            Fraud Risk & Security Intelligence
          </h1>
          <p className="page-subtitle">Transparent rule-based risk scoring, velocity anomaly detection, and account protection controls.</p>
        </div>
        <button onClick={loadFraud} className="btn btn-secondary">
          <FaRedo className={loading ? 'spin' : ''} /> Refresh Alerts
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* 6 Summary Metric Cards */}
      {loading ? (
        <StatCardSkeleton count={6} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Fraud Alerts</span>
              <div className="stat-icon-wrapper">
                <FaShieldAlt />
              </div>
            </div>
            <div className="stat-value">{totalAlerts}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Security Alerts</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Open Alerts</span>
              <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                <FaExclamationTriangle />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#d97706' }}>{openAlerts}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending Investigation</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">High Risk Alerts</span>
              <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <FaUserSecret />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{highRiskCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Risk Score &ge; 75</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Medium Risk Alerts</span>
              <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                <FaExclamationTriangle />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#d97706' }}>{medRiskCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Risk Score 40-74</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Low Risk Alerts</span>
              <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <FaCheckCircle />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#16a34a' }}>{lowRiskCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Risk Score 0-39</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Blocked Accounts</span>
              <div className="stat-icon-wrapper" style={{ background: '#ffe4e6', color: '#991b1b' }}>
                <FaBan />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#991b1b' }}>{blockedCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status INACTIVE</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search customer, ID, or rule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
            </div>

            <div>
              <select className="form-select" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">HIGH Risk (&ge;75)</option>
                <option value="MEDIUM">MEDIUM Risk (40-74)</option>
                <option value="LOW">LOW Risk (0-39)</option>
              </select>
            </div>

            <div>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <strong>{filteredRecords.length}</strong> of {totalAlerts} Alerts
          </div>
        </div>
      </div>

      {/* Fraud Alerts Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Flagged Customer</th>
              <th>Risk Score & Level</th>
              <th>Triggered Rules</th>
              <th>Status</th>
              <th>Detected At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton rows={5} cols={7} />
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((f) => (
                <tr key={f.fraudId}>
                  <td>#{f.fraudId}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{f.customerName || 'Customer #' + f.customerId}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{f.customerId}</div>
                  </td>
                  <td>{renderRiskBadge(f.riskLevel, f.riskScore)}</td>
                  <td>
                    <span className="badge badge-role" style={{ fontSize: '12px' }}>
                      {f.detectedRules || 'ANOMALY_DETECTED'}
                    </span>
                  </td>
                  <td>{renderStatusBadge(f.status)}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {f.detectedAt ? new Date(f.detectedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setSelectedFraud(f);
                          setShowModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="View Details"
                      >
                        <FaEye /> Details
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(f.fraudId, 'UNDER_REVIEW')}
                        className="btn btn-secondary btn-sm"
                        disabled={f.status === 'UNDER_REVIEW'}
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(f.fraudId, 'BLOCKED')}
                        className="btn btn-danger btn-sm"
                        disabled={f.status === 'BLOCKED'}
                      >
                        <FaBan /> Block
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <EmptyState
                    icon={<FaShieldAlt />}
                    title="No Fraud Risk Alerts"
                    subtitle="No security risk alerts match your search or filter settings."
                    actionLabel={searchQuery || riskFilter !== 'ALL' || statusFilter !== 'ALL' ? "Reset Filters" : null}
                    onAction={() => {
                      setSearchQuery('');
                      setRiskFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fraud Details Modal */}
      {showModal && selectedFraud && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FaShieldAlt style={{ color: 'var(--primary)' }} /> Fraud Alert Details #{selectedFraud.fraudId}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>Flagged Customer</span>
                  <div style={{ fontWeight: 800 }}>{selectedFraud.customerName || 'N/A'} (ID: #{selectedFraud.customerId})</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>Risk Assessment</span>
                  <div>{renderRiskBadge(selectedFraud.riskLevel, selectedFraud.riskScore)}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>Performed By Operator</span>
                  <div style={{ fontWeight: 700 }}>{selectedFraud.performedByName || 'System'} ({selectedFraud.performedByRole || 'STAFF'})</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>Current Status</span>
                  <div>{renderStatusBadge(selectedFraud.status)}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>Triggered Risk Rules</h4>
              <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#be123c', fontWeight: 700, fontSize: '13px' }}>
                {selectedFraud.detectedRules || 'ANOMALY_DETECTED'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>Detection Description & Reason</h4>
              <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedFraud.description || 'Automatic velocity anomaly detected on point transaction.'}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>Take Security Action</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateStatus(selectedFraud.fraudId, 'UNDER_REVIEW')}
                  disabled={actionProcessing || selectedFraud.status === 'UNDER_REVIEW'}
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
                  onClick={() => handleUpdateStatus(selectedFraud.fraudId, 'CONFIRMED')}
                  disabled={actionProcessing || selectedFraud.status === 'CONFIRMED'}
                >
                  Confirm Fraud
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateStatus(selectedFraud.fraudId, 'FALSE_POSITIVE')}
                  disabled={actionProcessing || selectedFraud.status === 'FALSE_POSITIVE'}
                >
                  False Positive
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUpdateStatus(selectedFraud.fraudId, 'BLOCKED')}
                  disabled={actionProcessing || selectedFraud.status === 'BLOCKED'}
                >
                  <FaBan /> Block Customer
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleUpdateStatus(selectedFraud.fraudId, 'RESOLVED')}
                  disabled={actionProcessing || selectedFraud.status === 'RESOLVED'}
                >
                  <FaCheck /> Resolve Case
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
