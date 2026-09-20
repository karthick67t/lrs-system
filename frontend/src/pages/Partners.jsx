import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaHandshake, FaPlus, FaRedo, FaTrash, FaBuilding } from 'react-icons/fa';

export const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'RETAIL',
    status: 'ACTIVE',
  });

  const loadPartners = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/partners');
      setPartners(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load partner ecosystem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/partners', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess('Partner merchant registered successfully.');
      setShowAddModal(false);
      loadPartners();
    } catch (err) {
      setError(err.message || 'Failed to register partner.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this partner merchant?')) return;
    try {
      await apiFetch(`/api/partners/${id}`, { method: 'DELETE' });
      setSuccess('Partner removed.');
      loadPartners();
    } catch (err) {
      setError(err.message || 'Failed to remove partner.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Merchant Partner Directory</h1>
          <p className="page-subtitle">Manage external coalition partner merchants for cross-brand point redemptions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadPartners} className="btn btn-secondary"><FaRedo /> Refresh</button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary"><FaPlus /> Add Merchant Partner</button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {partners.map((p) => (
          <div key={p.partnerId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-role">{p.category}</span>
                <span className={`badge ${p.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>{p.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaBuilding style={{ color: 'var(--primary)', fontSize: '20px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{p.name}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{p.description}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => handleDelete(p.partnerId)} className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '12px' }}>
                <FaTrash /> Remove Partner
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Register Partner Merchant</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Partner Brand Name</label>
                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Integration Description</label>
                <textarea className="form-textarea" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Industry Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="AIRLINES">AIRLINES</option>
                  <option value="HOSPITALITY">HOSPITALITY</option>
                  <option value="RETAIL">RETAIL</option>
                  <option value="DINING">DINING</option>
                  <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
