import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaGift, FaPlus, FaSearch, FaRedo, FaTrash, FaCheckCircle, FaLock, FaTimes, FaInbox } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';

export const Rewards = () => {
  const { role, memberId, user } = useAuth();
  const isCustomer = role === 'CUSTOMER';

  const [rewards, setRewards] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    pointsRequired: 500,
    stock: 50,
    category: 'VOUCHERS',
    status: 'ACTIVE',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isCustomer) {
        const rData = await apiFetch('/api/rewards');
        setRewards(rData || []);
      } else {
        const [rData, mData] = await Promise.all([
          apiFetch('/api/rewards'),
          apiFetch('/api/members'),
        ]);
        setRewards(rData || []);
        setMembers(mData || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load rewards catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleOpenAdd = () => {
    setRewardForm({
      name: '',
      description: '',
      pointsRequired: 500,
      stock: 50,
      category: 'VOUCHERS',
      status: 'ACTIVE',
    });
    setShowAddModal(true);
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/rewards', {
        method: 'POST',
        body: JSON.stringify(rewardForm),
      });
      setSuccess('New reward created successfully in catalog.');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create reward.');
    }
  };

  const handleDeleteReward = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    try {
      await apiFetch(`/api/rewards/${id}`, { method: 'DELETE' });
      setSuccess('Reward deleted successfully.');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete reward.');
    }
  };

  const handleOpenRedeem = (r) => {
    setSelectedReward(r);
    if (isCustomer) {
      setSelectedMemberId(memberId || user?.memberId);
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].memberId);
    }
    setShowRedeemModal(true);
  };

  const handleRedeemReward = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetId = isCustomer ? (memberId || user?.memberId) : selectedMemberId;

    if (!selectedReward || !targetId) {
      setError('Please select a valid member account for redemption.');
      return;
    }

    try {
      const tx = await apiFetch(`/api/rewards/${selectedReward.rewardId}/redeem/${targetId}`, {
        method: 'POST',
      });
      setSuccess(`Redemption successful! ${selectedReward.name} redeemed for ${tx.member?.fullName || 'Account'}. New Balance: ${tx.member?.points} pts.`);
      setShowRedeemModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Redemption failed.');
    }
  };

  const filteredRewards = rewards.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaGift style={{ color: 'var(--primary)' }} />
            Rewards Catalog & Redemption
          </h1>
          <p className="page-subtitle">
            {isCustomer
              ? 'Browse rewards and exchange your points for gift cards, vouchers, and exclusive perks.'
              : 'Manage reward items, inventory stock, and process member point redemptions.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadData} className="btn btn-secondary">
            <FaRedo className={loading ? 'spin' : ''} /> Refresh Catalog
          </button>
          {!isCustomer && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <FaPlus /> Add New Reward
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search rewards catalog by name or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '180px' }}>
            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="TRAVEL">TRAVEL</option>
              <option value="VOUCHERS">VOUCHERS</option>
              <option value="ELECTRONICS">ELECTRONICS</option>
              <option value="DINING">DINING</option>
              <option value="FASHION">FASHION</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredRewards.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredRewards.map((r) => (
            <div key={r.rewardId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span className="badge badge-role">{r.category}</span>
                  <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                    <span className="badge-dot"></span>{r.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>{r.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px', lineHeight: 1.5 }}>{r.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Points Required:</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>{r.pointsRequired} pts</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Stock Available:</span>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: r.stock > 0 ? '#16a34a' : '#dc2626' }}>
                      {r.stock > 0 ? `${r.stock} units` : 'Out of Stock'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenRedeem(r)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={r.stock <= 0 || r.status !== 'ACTIVE'}
                  >
                    <FaGift /> Redeem Reward
                  </button>
                  {!isCustomer && (
                    <button onClick={() => handleDeleteReward(r.rewardId)} className="btn btn-danger btn-sm" title="Delete Reward">
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FaGift />}
          title="No Rewards Found"
          subtitle="No reward items match your search or category filter."
          actionLabel={search || categoryFilter !== 'ALL' ? "Clear Filters" : (!isCustomer ? "Add First Reward" : null)}
          onAction={() => {
            if (search || categoryFilter !== 'ALL') {
              setSearch('');
              setCategoryFilter('ALL');
            } else if (!isCustomer) {
              handleOpenAdd();
            }
          }}
        />
      )}

      {/* Create Reward Modal */}
      {showAddModal && !isCustomer && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add New Reward Item</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateReward}>
              <div className="form-group">
                <label className="form-label">Reward Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                  placeholder="e.g. ₹500 Shopping Voucher"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  placeholder="Details and terms of the reward..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Points Required</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={rewardForm.pointsRequired}
                    onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={rewardForm.stock}
                    onChange={(e) => setRewardForm({ ...rewardForm, stock: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={rewardForm.category}
                  onChange={(e) => setRewardForm({ ...rewardForm, category: e.target.value })}
                >
                  <option value="TRAVEL">TRAVEL</option>
                  <option value="VOUCHERS">VOUCHERS</option>
                  <option value="ELECTRONICS">ELECTRONICS</option>
                  <option value="DINING">DINING</option>
                  <option value="FASHION">FASHION</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Reward Modal */}
      {showRedeemModal && selectedReward && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Redeem: {selectedReward.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowRedeemModal(false)}>
                <FaTimes />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Required Points: <strong>{selectedReward.pointsRequired} pts</strong> &bull; Available Stock: <strong>{selectedReward.stock} units</strong>
            </p>

            <form onSubmit={handleRedeemReward}>
              {isCustomer ? (
                <div className="alert-success" style={{ marginBottom: '16px' }}>
                  Redeeming reward for your account (<strong>{user?.fullName}</strong>).
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Select Target Member Account</label>
                  <select
                    className="form-select"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m.memberId} value={m.memberId}>
                        {m.fullName} &bull; Available: {m.points} pts ({m.points >= selectedReward.pointsRequired ? 'SUFFICIENT' : 'INSUFFICIENT'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowRedeemModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheckCircle /> Confirm Point Redemption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
