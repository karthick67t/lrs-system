import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaDollarSign, FaPlus, FaRedo, FaTrash, FaBalanceScale } from 'react-icons/fa';

export const Finance = () => {
  const [financeRecords, setFinanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    transactionId: null,
    type: 'REVENUE',
    description: '',
    amount: 500.0,
    points: 1000,
    status: 'SETTLED',
  });

  const loadFinance = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/finance');
      setFinanceRecords(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load financial ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/finance', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess('Financial ledger entry recorded successfully.');
      setShowAddModal(false);
      loadFinance();
    } catch (err) {
      setError(err.message || 'Failed to save financial entry.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete financial record?')) return;
    try {
      await apiFetch(`/api/finance/${id}`, { method: 'DELETE' });
      setSuccess('Record deleted.');
      loadFinance();
    } catch (err) {
      setError(err.message || 'Failed to delete record.');
    }
  };

  const totalRevenue = financeRecords.filter((f) => f.type === 'REVENUE').reduce((s, f) => s + (f.amount || 0), 0);
  const totalLiability = financeRecords.filter((f) => f.type === 'LIABILITY').reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Loyalty Finance & Points Liability</h1>
          <p className="page-subtitle">Reconcile revenue contributions, reward redemption costs, and outstanding point liabilities.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadFinance} className="btn btn-secondary"><FaRedo /> Refresh</button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary"><FaPlus /> Add Ledger Record</button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <span className="stat-label">Total Recognized Revenue</span>
          <div className="stat-value" style={{ color: '#16a34a' }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Co-Op Partner Sponsorships</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Points Liability</span>
          <div className="stat-value" style={{ color: '#dc2626' }}>${totalLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Accrued Redemption Cost</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount ($)</th>
              <th>Points Impact</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {financeRecords.map((f) => (
              <tr key={f.financeId}>
                <td>#{f.financeId}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{f.date ? new Date(f.date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className={`badge ${f.type === 'REVENUE' ? 'badge-active' : 'badge-inactive'}`}>
                    {f.type}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{f.description}</td>
                <td style={{ fontWeight: 800, color: f.type === 'REVENUE' ? '#16a34a' : '#dc2626' }}>
                  ${f.amount ? f.amount.toFixed(2) : '0.00'}
                </td>
                <td>{f.points} pts</td>
                <td><span className="badge badge-silver">{f.status}</span></td>
                <td>
                  <button onClick={() => handleDelete(f.financeId)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {financeRecords.length === 0 && !loading && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No financial ledger entries recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Add Finance Ledger Entry</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Ledger Event Type</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="REVENUE">REVENUE (Sponsorship / Sales)</option>
                  <option value="LIABILITY">LIABILITY (Point Accrual)</option>
                  <option value="ISSUANCE_COST">ISSUANCE_COST (Reward Fulfillment)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Monetary Amount ($)</label>
                  <input type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Points Impact</label>
                  <input type="number" className="form-input" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
