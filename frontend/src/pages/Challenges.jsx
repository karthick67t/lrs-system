import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaTrophy, FaPlus, FaRedo, FaSlidersH, FaTrash } from 'react-icons/fa';

export const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    target: 500,
    progress: 0,
    category: 'PROMOTION',
    status: 'ACTIVE',
  });

  const loadChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/challenges');
      setChallenges(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/challenges', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess('Challenge created successfully.');
      setShowAddModal(false);
      loadChallenges();
    } catch (err) {
      setError(err.message || 'Failed to create challenge.');
    }
  };

  const handleUpdateProgress = async (id, currentProgress) => {
    const newProgressStr = window.prompt('Enter new progress value:', currentProgress);
    if (newProgressStr === null) return;
    const newProgress = parseInt(newProgressStr);
    if (isNaN(newProgress) || newProgress < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      await apiFetch(`/api/challenges/${id}/progress?progress=${newProgress}`, {
        method: 'PUT',
      });
      setSuccess('Challenge progress updated.');
      loadChallenges();
    } catch (err) {
      setError(err.message || 'Failed to update progress.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this challenge campaign?')) return;
    try {
      await apiFetch(`/api/challenges/${id}`, { method: 'DELETE' });
      setSuccess('Challenge deleted.');
      loadChallenges();
    } catch (err) {
      setError(err.message || 'Failed to delete challenge.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Loyalty Challenges & Gamification</h1>
          <p className="page-subtitle">Track participant progress across promotional loyalty sprint campaigns.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadChallenges} className="btn btn-secondary"><FaRedo /> Refresh</button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary"><FaPlus /> Create Challenge</button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {challenges.map((c) => {
          const percent = Math.min(100, Math.round(((c.progress || 0) / (c.target || 1)) * 100));
          return (
            <div key={c.challengeId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-role">{c.category}</span>
                  <span className={`badge ${c.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>{c.status}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{c.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{c.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Campaign Progress</span>
                  <span>{c.progress} / {c.target} ({percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-gradient)' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleUpdateProgress(c.challengeId, c.progress)} className="btn btn-secondary" style={{ flex: 1 }}>
                    <FaSlidersH /> Update Progress
                  </button>
                  <button onClick={() => handleDelete(c.challengeId)} className="btn btn-danger" style={{ padding: '10px 12px' }}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Create Loyalty Challenge</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Challenge Title</label>
                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Target Metric</label>
                  <input type="number" className="form-input" value={form.target} onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Progress</label>
                  <input type="number" className="form-input" value={form.progress} onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="PROMOTION">PROMOTION</option>
                  <option value="DIGITAL">DIGITAL</option>
                  <option value="TIER_UPGRADE">TIER_UPGRADE</option>
                  <option value="SEASONAL">SEASONAL</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Challenge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
