import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaPaperPlane, FaTimesCircle, FaPlus, FaRedo, FaTrash, FaCommentAlt, FaTimes, FaBullhorn } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

export const Notifications = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'PROMOTIONAL',
    audience: 'ALL',
    status: 'SCHEDULED',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
  });

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess('Notification broadcast campaign scheduled.');
      setShowAddModal(false);
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to schedule notification.');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch('/api/notifications/announcement', {
        method: 'POST',
        body: JSON.stringify(announcementForm),
      });
      setSuccess(`✓ ${res.message || 'Announcement sent successfully!'}`);
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', message: '' });
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to send announcement.');
    }
  };

  const handleSend = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/send`, { method: 'POST' });
      setSuccess('Notification sent successfully to target audience!');
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to send notification.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/cancel`, { method: 'PUT' });
      setSuccess('Notification campaign cancelled.');
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to cancel notification.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete notification record?')) return;
    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setSuccess('Notification deleted.');
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to delete notification.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaBell style={{ color: 'var(--primary)' }} />
            Notification Center
          </h1>
          <p className="page-subtitle">Schedule and dispatch promotional notifications, tier alerts, and system broadcasts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadNotifications} className="btn btn-secondary">
            <FaRedo className={loading ? 'spin' : ''} /> Refresh
          </button>
          {isSuperAdmin && (
            <button onClick={() => setShowAnnouncementModal(true)} className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
              <FaBullhorn /> Announcement
            </button>
          )}
          {isSuperAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <FaPlus /> New Campaign
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title & Message</th>
              <th>Type</th>
              <th>Audience</th>
              <th>Status</th>
              {isSuperAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton rows={5} cols={isSuperAdmin ? 6 : 5} />
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <tr key={n.notificationId}>
                  <td>#{n.notificationId}</td>
                  <td>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {n.type === 'ANNOUNCEMENT' && <span style={{ fontSize: '15px' }}>📢</span>}
                      <span>{n.title}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.message}</div>
                  </td>
                  <td>
                    <span className={`badge ${n.type === 'ANNOUNCEMENT' ? 'badge-gold' : 'badge-role'}`}>
                      {n.type}
                    </span>
                  </td>
                  <td><span className="badge badge-silver">{n.audience || 'MANAGERS & STAFF'}</span></td>
                  <td>
                    <span className={`badge ${n.status === 'SENT' ? 'badge-active' : n.status === 'CANCELLED' ? 'badge-inactive' : 'badge-gold'}`}>
                      <span className="badge-dot"></span>{n.status}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(n.title?.includes('Complaint') || n.message?.includes('Complaint')) && (
                          <Link to="/complaints" className="btn btn-primary btn-sm">
                            <FaCommentAlt /> View Complaints
                          </Link>
                        )}
                        {n.status === 'SCHEDULED' && (
                          <button onClick={() => handleSend(n.notificationId)} className="btn btn-primary btn-sm">
                            <FaPaperPlane /> Send Now
                          </button>
                        )}
                        {n.status === 'SCHEDULED' && (
                          <button onClick={() => handleCancel(n.notificationId)} className="btn btn-secondary btn-sm">
                            <FaTimesCircle /> Cancel
                          </button>
                        )}
                        <button onClick={() => handleDelete(n.notificationId)} className="btn btn-danger btn-sm">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSuperAdmin ? 6 : 5}>
                  <EmptyState
                    icon={<FaBell />}
                    title="No Notification Campaigns"
                    subtitle="No promotional or system broadcast notifications have been scheduled yet."
                    actionLabel={isSuperAdmin ? "Send Announcement" : undefined}
                    onAction={isSuperAdmin ? () => setShowAnnouncementModal(true) : undefined}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SUPER_ADMIN Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📢</span> Create Admin Announcement
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAnnouncementModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', color: '#92400e', fontSize: '13px', marginBottom: '16px' }}>
              Announcements will be dispatched immediately to all active <strong>LOYALTY_MANAGER</strong> and <strong>STAFF</strong> members. CUSTOMER users will not receive this announcement.
            </div>

            <form onSubmit={handleSendAnnouncement}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. System maintenance tonight at 10 PM."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="Details of the announcement..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                  <FaBullhorn /> Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Campaign Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Broadcast Notification</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Notification Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Double Points Weekend Special!"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notification Message</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Body content for target audience..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Notification Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="PROMOTIONAL">PROMOTIONAL</option>
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="TIER_ALERT">TIER_ALERT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-select" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                    <option value="ALL">ALL MEMBERS</option>
                    <option value="GOLD">GOLD & PLATINUM ONLY</option>
                    <option value="INACTIVE">INACTIVE MEMBERS</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Schedule Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
