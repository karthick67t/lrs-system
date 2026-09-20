import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import {
  FaCommentAlt,
  FaRedo,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaTimes,
  FaEdit,
  FaEye
} from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

export const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Complaint Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('NEW');

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/complaints');
      setComplaints(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load customer complaints roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || 'NEW');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    setError('');
    setSuccessMsg('');

    try {
      const updated = await apiFetch(`/api/complaints/${selectedComplaint.complaintId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      setSuccessMsg(`Complaint #${updated.complaintId} status updated to ${updated.status}.`);
      setSelectedComplaint(updated);
      loadComplaints();
    } catch (err) {
      setError(err.message || 'Failed to update complaint status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="badge badge-inactive"><span className="badge-dot"></span>NEW</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-gold"><span className="badge-dot"></span>IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="badge badge-active"><span className="badge-dot"></span>RESOLVED</span>;
      default:
        return <span className="badge badge-silver">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return String(dateStr);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.fullName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.complaintId?.toString() === q ||
      `#${c.complaintId}` === q;

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaCommentAlt style={{ color: 'var(--primary)' }} />
            Customer Complaints Management
          </h1>
          <p className="page-subtitle">Review, track, and resolve public customer complaints and support inquiries.</p>
        </div>
        <button onClick={loadComplaints} className="btn btn-secondary">
          <FaRedo className={loading ? 'spin' : ''} /> Refresh Complaints
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
      {successMsg && (
        <div className="card" style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCheckCircle style={{ color: '#16a34a', fontSize: '18px' }} />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search complaint by ID, name, email, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '180px' }}>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name & Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton rows={5} cols={7} />
            ) : filteredComplaints.length > 0 ? (
              filteredComplaints.map((c) => (
                <tr key={c.complaintId}>
                  <td>#{c.complaintId}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.phone || 'N/A'}</td>
                  <td style={{ fontWeight: 700, maxWidth: '240px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.subject}
                    </div>
                  </td>
                  <td>{renderStatusBadge(c.status)}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleOpenDetail(c)}
                      className="btn btn-secondary btn-sm"
                    >
                      <FaEye /> View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <EmptyState
                    icon={<FaCommentAlt />}
                    title="No Complaints Found"
                    subtitle="No customer complaint tickets match your search criteria."
                    actionLabel={search || statusFilter !== 'ALL' ? "Clear Search" : null}
                    onAction={() => {
                      setSearch('');
                      setStatusFilter('ALL');
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Complaint Detail & Status Update Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px' }}
          >
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>COMPLAINT #{selectedComplaint.complaintId}</div>
                <h3 className="modal-title" style={{ marginTop: '2px' }}>
                  {selectedComplaint.subject}
                </h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{selectedComplaint.fullName}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedComplaint.phone || 'N/A'}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>{selectedComplaint.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <div>{renderStatusBadge(selectedComplaint.status)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Submitted: {formatDate(selectedComplaint.createdAt)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                Complaint Message Details:
              </div>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedComplaint.message}
              </div>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Update Complaint Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="btn btn-primary"
                >
                  {updatingStatus ? 'Updating Status...' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;
