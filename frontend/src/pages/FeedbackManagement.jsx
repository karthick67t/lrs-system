import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  FaCommentAlt,
  FaStar,
  FaSearch,
  FaFilter,
  FaRedo,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaMeh,
  FaTimes,
  FaAward,
  FaUserAlt
} from 'react-icons/fa';

export const FeedbackManagement = () => {
  const { role } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal State
  const [selectedFb, setSelectedFb] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [listData, analyticsData] = await Promise.all([
        apiFetch('/api/feedback'),
        apiFetch('/api/feedback/analytics').catch(() => null),
      ]);
      setFeedbackList(listData || []);
      setAnalytics(analyticsData || null);
    } catch (err) {
      setError(err.message || 'Failed to load customer feedback repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (fbId, newStatus) => {
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const updated = await apiFetch(`/api/feedback/${fbId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccess(`Feedback #${fbId} status updated to ${newStatus}.`);
      if (selectedFb && selectedFb.feedbackId === fbId) {
        setSelectedFb(updated);
      }
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update feedback status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredList = feedbackList.filter((f) => {
    const matchesSearch =
      (f.customerName && f.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (f.comment && f.comment.toLowerCase().includes(search.toLowerCase())) ||
      (f.rewardName && f.rewardName.toLowerCase().includes(search.toLowerCase()));

    const matchesRating = ratingFilter === 'ALL' || f.rating?.toString() === ratingFilter;
    const matchesSentiment = sentimentFilter === 'ALL' || f.sentiment === sentimentFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || f.feedbackType === typeFilter;

    return matchesSearch && matchesRating && matchesSentiment && matchesStatus && matchesType;
  });

  const renderStars = (starCount) => {
    return (
      <div style={{ display: 'inline-flex', gap: '2px', color: '#f59e0b' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar key={s} style={{ opacity: s <= starCount ? 1 : 0.25, fontSize: '13px' }} />
        ))}
      </div>
    );
  };

  const renderSentimentBadge = (sentiment) => {
    if (sentiment === 'POSITIVE') {
      return <span className="badge badge-active"><FaThumbsUp /> POSITIVE</span>;
    } else if (sentiment === 'NEGATIVE') {
      return <span className="badge badge-inactive" style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}><FaThumbsDown /> NEGATIVE</span>;
    }
    return <span className="badge badge-silver"><FaMeh /> NEUTRAL</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Feedback & Ratings Management</h1>
          <p className="page-subtitle">Review verified customer ratings, analyze sentiment, and resolve loyalty issues.</p>
        </div>
        <button onClick={loadData} className="btn btn-secondary">
          <FaRedo /> Refresh Data
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Summary KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Submissions</span>
            <FaCommentAlt style={{ color: 'var(--primary)', fontSize: '18px' }} />
          </div>
          <div className="stat-value">{loading ? '...' : analytics?.totalFeedback ?? feedbackList.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Customer Reviews</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Average Star Rating</span>
            <FaStar style={{ color: '#f59e0b', fontSize: '18px' }} />
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {loading ? '...' : analytics?.avgRating ?? 0.0} / 5.0
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall Program Satisfaction</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Positive Sentiment</span>
            <FaThumbsUp style={{ color: '#16a34a', fontSize: '18px' }} />
          </div>
          <div className="stat-value" style={{ color: '#16a34a' }}>
            {loading ? '...' : `${analytics?.positivePercentage ?? 0}%`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{analytics?.positiveCount ?? 0} Positive Entries</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Pending Review</span>
            <FaClock style={{ color: '#d97706', fontSize: '18px' }} />
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {loading ? '...' : analytics?.pendingReview ?? 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE Status Submissions</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search customer, comment or reward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '130px' }}>
            <select className="form-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select className="form-select" value={sentimentFilter} onChange={(e) => setSentimentFilter(e.target.value)}>
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">POSITIVE</option>
              <option value="NEUTRAL">NEUTRAL</option>
              <option value="NEGATIVE">NEGATIVE</option>
            </select>
          </div>

          <div style={{ width: '140px' }}>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="GENERAL">GENERAL</option>
              <option value="REWARD">REWARD</option>
              <option value="TRANSACTION">TRANSACTION</option>
              <option value="PARTNER">PARTNER</option>
            </select>
          </div>

          <div style={{ width: '130px' }}>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="HIDDEN">HIDDEN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Category</th>
              <th>Comment Snippet</th>
              <th>Sentiment</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((f) => (
              <tr key={f.feedbackId}>
                <td>#{f.feedbackId}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{f.customerName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cust ID #{f.customerId}</div>
                </td>
                <td>{renderStars(f.rating)}</td>
                <td>
                  <span className="badge badge-role" style={{ fontSize: '11px' }}>{f.feedbackType}</span>
                </td>
                <td style={{ maxWidth: '240px', fontSize: '13px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.comment || '(No comment text)'}
                  </div>
                  {f.rewardName && <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>🎁 {f.rewardName}</div>}
                </td>
                <td>{renderSentimentBadge(f.sentiment)}</td>
                <td>
                  <span className={`badge ${f.status === 'RESOLVED' ? 'badge-active' : f.status === 'HIDDEN' ? 'badge-inactive' : f.status === 'REVIEWED' ? 'badge-platinum' : 'badge-gold'}`}>
                    {f.status}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setSelectedFb(f)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} title="View Full Details">
                      <FaEye />
                    </button>
                    {f.status === 'ACTIVE' && (
                      <button onClick={() => handleUpdateStatus(f.feedbackId, 'REVIEWED')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} title="Mark Reviewed">
                        Review
                      </button>
                    )}
                    {f.status !== 'RESOLVED' && (
                      <button onClick={() => handleUpdateStatus(f.feedbackId, 'RESOLVED')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#16a34a', borderColor: '#16a34a' }} title="Mark Resolved">
                        <FaCheckCircle />
                      </button>
                    )}
                    {f.status !== 'HIDDEN' ? (
                      <button onClick={() => handleUpdateStatus(f.feedbackId, 'HIDDEN')} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} title="Hide Inappropriate Feedback">
                        <FaEyeSlash />
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateStatus(f.feedbackId, 'ACTIVE')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} title="Restore Feedback">
                        Unhide
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && !loading && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No customer feedback entries found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedFb && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCommentAlt style={{ color: 'var(--primary)' }} /> Feedback Detail #{selectedFb.feedbackId}
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedFb(null)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>{selectedFb.customerName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer ID: #{selectedFb.customerId}</div>
                </div>
                <div>{renderStars(selectedFb.rating)}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>COMMENT TEXT</div>
                <div style={{ fontSize: '14px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {selectedFb.comment || '(No comment provided)'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Category:</span> <strong>{selectedFb.feedbackType}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sentiment:</span> {renderSentimentBadge(selectedFb.sentiment)}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{selectedFb.status}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Submitted:</span> <strong>{selectedFb.createdAt ? new Date(selectedFb.createdAt).toLocaleString() : 'N/A'}</strong>
                </div>
                {selectedFb.rewardName && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Associated Reward:</span> <strong>🎁 {selectedFb.rewardName} (ID #{selectedFb.rewardId})</strong>
                  </div>
                )}
                {selectedFb.transactionId && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Associated Transaction:</span> <strong>Tx #{selectedFb.transactionId}</strong>
                  </div>
                )}
                {selectedFb.reviewedBy && (
                  <div style={{ gridColumn: 'span 2', color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                    Reviewed by <strong>{selectedFb.reviewedBy}</strong> on {selectedFb.reviewedAt ? new Date(selectedFb.reviewedAt).toLocaleString() : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedFb.status !== 'RESOLVED' && (
                <button
                  className="btn btn-primary"
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleUpdateStatus(selectedFb.feedbackId, 'RESOLVED')}
                  disabled={updating}
                >
                  <FaCheckCircle /> Mark as Resolved
                </button>
              )}
              {selectedFb.status === 'ACTIVE' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleUpdateStatus(selectedFb.feedbackId, 'REVIEWED')}
                  disabled={updating}
                >
                  Mark as Reviewed
                </button>
              )}
              {selectedFb.status !== 'HIDDEN' && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleUpdateStatus(selectedFb.feedbackId, 'HIDDEN')}
                  disabled={updating}
                >
                  <FaEyeSlash /> Hide Feedback
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedFb(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
