import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaSearch, FaCoins, FaPlusCircle, FaMinusCircle, FaAward, FaHistory, FaUserAlt, FaPhoneAlt, FaCheck, FaTimes } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

export const EarnPoints = () => {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);

  // Earn Section State
  const [billAmount, setBillAmount] = useState('');
  const [earnDesc, setEarnDesc] = useState('');
  const [earning, setEarning] = useState(false);
  const [showEarnConfirm, setShowEarnConfirm] = useState(false);

  // Deduct Section State
  const [deductPoints, setDeductPoints] = useState('');
  const [deductDesc, setDeductDesc] = useState('');
  const [deducting, setDeducting] = useState(false);
  const [showDeductConfirm, setShowDeductConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingTx, setLoadingTx] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await apiFetch('/api/members');
      const customerList = (data || []).filter(m => m.role === 'CUSTOMER' || !m.role);
      setMembers(customerList);
      if (customerList.length > 0 && !selectedMember) {
        setSelectedMember(customerList[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load member list.');
    }
  };

  const loadCustomerTransactions = async (memberId) => {
    if (!memberId) return;
    setLoadingTx(true);
    try {
      const allTx = await apiFetch('/api/transactions');
      const filtered = (allTx || []).filter(
        (t) => (t.memberId === memberId) || (t.member && t.member.memberId === memberId) || (t.customerId === memberId)
      );
      setCustomerTransactions(filtered);
    } catch (err) {
      // Non-critical
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      loadCustomerTransactions(selectedMember.memberId);
    }
  }, [selectedMember]);

  const matchingMembers = searchQuery.trim() === '' ? [] : members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesId = m.memberId?.toString() === q || `#${m.memberId}` === q;
    const matchesName = m.fullName?.toLowerCase().includes(q);
    const matchesPhone = m.phone && m.phone.includes(q);
    const matchesEmail = m.email?.toLowerCase().includes(q);
    return matchesId || matchesName || matchesPhone || matchesEmail;
  });

  const calculatedEarnPoints = billAmount && !isNaN(billAmount) && parseFloat(billAmount) > 0
    ? Math.floor(parseFloat(billAmount) / 10.0)
    : 0;

  const numericDeductPoints = parseInt(deductPoints) || 0;
  const projectedEarnBalance = (selectedMember?.points || 0) + calculatedEarnPoints;
  const projectedDeductBalance = (selectedMember?.points || 0) - numericDeductPoints;

  const handleEarnClick = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMember) {
      setError('Please search and select a customer first.');
      return;
    }

    if (!billAmount || parseFloat(billAmount) <= 0) {
      setError('Please enter a valid Customer Bill Amount (₹) greater than zero.');
      return;
    }

    if (calculatedEarnPoints <= 0) {
      setError('Bill amount must be at least ₹10 to earn 1 loyalty point (₹10 = 1 point).');
      return;
    }

    setShowEarnConfirm(true);
  };

  const confirmEarnSubmit = async () => {
    setShowEarnConfirm(false);
    setEarning(true);
    setError('');
    setSuccess('');

    try {
      const updated = await apiFetch(`/api/members/${selectedMember.memberId}/earn-points`, {
        method: 'POST',
        body: JSON.stringify({
          billAmount: parseFloat(billAmount),
          description: earnDesc || `Earned points on Purchase Bill ₹${parseFloat(billAmount).toFixed(2)}`,
        }),
      });

      setSuccess(`Successfully added ${calculatedEarnPoints} points to customer ${updated.fullName}! New Balance: ${updated.points} pts (Tier: ${updated.tier}).`);
      setBillAmount('');
      setEarnDesc('');
      setSelectedMember(updated);
      loadMembers();
      loadCustomerTransactions(updated.memberId);
    } catch (err) {
      setError(err.message || 'Failed to add points.');
    } finally {
      setEarning(false);
    }
  };

  const handleDeductClick = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMember) {
      setError('Please search and select a customer first.');
      return;
    }

    if (numericDeductPoints <= 0) {
      setError('Points to deduct must be greater than zero.');
      return;
    }

    if (numericDeductPoints > selectedMember.points) {
      setError(`Cannot deduct ${numericDeductPoints} points. Customer available balance is ${selectedMember.points} pts.`);
      return;
    }

    setShowDeductConfirm(true);
  };

  const confirmDeductSubmit = async () => {
    setShowDeductConfirm(false);
    setDeducting(true);
    setError('');
    setSuccess('');

    try {
      const updated = await apiFetch(`/api/members/${selectedMember.memberId}/deduct-points`, {
        method: 'POST',
        body: JSON.stringify({
          points: numericDeductPoints,
          description: deductDesc || `Manual points deduction / penalty correction`,
        }),
      });

      setSuccess(`Deducted ${numericDeductPoints} points from ${updated.fullName}. New Balance: ${updated.points} pts.`);
      setDeductPoints('');
      setDeductDesc('');
      setSelectedMember(updated);
      loadMembers();
      loadCustomerTransactions(updated.memberId);
    } catch (err) {
      setError(err.message || 'Failed to deduct points.');
    } finally {
      setDeducting(false);
    }
  };

  const renderTierBadge = (tier) => {
    const cls = `badge badge-${tier?.toLowerCase() || 'bronze'}`;
    return <span className={cls}>{tier || 'BRONZE'}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaCoins style={{ color: 'var(--primary)' }} />
            Earn & Deduct Points Operations
          </h1>
          <p className="page-subtitle">
            Search customer accounts, add points based on purchase bills (₹10 = 1 pt), or apply deductions.
          </p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Customer Lookup Bar */}
      <div className="card" style={{ marginBottom: '28px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>Lookup Customer Account</h3>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', fontSize: '15px' }}
            placeholder="Search customer by ID (#101), Full Name, Email, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)', fontSize: '16px' }} />
        </div>

        {/* Live Search Results */}
        {searchQuery.trim() !== '' && (
          <div style={{ marginTop: '12px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-surface)' }}>
            {matchingMembers.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                No customers found matching "{searchQuery}"
              </div>
            ) : (
              matchingMembers.map((m) => (
                <div
                  key={m.memberId}
                  onClick={() => {
                    setSelectedMember(m);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: selectedMember?.memberId === m.memberId ? 'var(--primary-light)' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>
                      {m.fullName} <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>(ID: #{m.memberId})</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📞 {m.phone || 'N/A'} &bull; ✉️ {m.email}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '15px' }}>{m.points} pts</div>
                    <div>{renderTierBadge(m.tier)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Customer Banner */}
      {selectedMember && (
        <div className="card" style={{ marginBottom: '28px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                ACTIVE CUSTOMER SELECTION
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaUserAlt style={{ color: 'var(--primary)', fontSize: '20px' }} />
                {selectedMember.fullName}
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>[ID: #{selectedMember.memberId}]</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '4px' }}>
                <span><FaPhoneAlt /> Phone: <strong>{selectedMember.phone || 'N/A'}</strong></span>
                <span>✉️ Email: <strong>{selectedMember.email}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>CURRENT BALANCE</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)' }}>
                  {selectedMember.points.toLocaleString()} <span style={{ fontSize: '16px' }}>pts</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>CURRENT TIER</div>
                {renderTierBadge(selectedMember.tier)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Point Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Earn Points Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#16a34a' }}>
              <FaPlusCircle /> Earn Points (Purchase Bill)
            </h3>
          </div>

          <form onSubmit={handleEarnClick}>
            <div className="form-group">
              <label className="form-label">Customer Bill Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1000"
                  min="0"
                  step="any"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  required
                />
                <span style={{ position: 'absolute', right: '14px', top: '10px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>INR (₹)</span>
              </div>
              <div className="form-help">
                * Rule: 1 point earned for every ₹10 spent
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Calculated Points Earned</label>
              <input
                type="text"
                className="form-input"
                style={{ backgroundColor: '#f8fafc', fontWeight: 800, color: '#16a34a', fontSize: '16px' }}
                value={`${calculatedEarnPoints} points`}
                readOnly
              />
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ color: '#166534', fontWeight: 600 }}>Points to Add:</span>
                <span style={{ fontWeight: 900, color: '#16a34a', fontSize: '18px' }}>+{calculatedEarnPoints} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#15803d' }}>
                <span>New Customer Balance:</span>
                <span><strong>{projectedEarnBalance.toLocaleString()} pts</strong></span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bill Description / Notes (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Store Bill #9821"
                value={earnDesc}
                onChange={(e) => setEarnDesc(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
              disabled={earning || !selectedMember || calculatedEarnPoints <= 0}
            >
              <FaCoins /> {earning ? 'Processing Add Points...' : `Add ${calculatedEarnPoints} Points`}
            </button>
          </form>
        </div>

        {/* Deduct Points Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#dc2626' }}>
              <FaMinusCircle /> Deduct Points
            </h3>
          </div>

          <form onSubmit={handleDeductClick}>
            <div className="form-group">
              <label className="form-label">Points to Deduct</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 200"
                min="1"
                max={selectedMember?.points || 0}
                value={deductPoints}
                onChange={(e) => setDeductPoints(e.target.value)}
                required
              />
              <div className="form-help">
                * Available balance: <strong>{selectedMember?.points || 0} pts</strong>
              </div>
            </div>

            <div style={{ background: projectedDeductBalance < 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${projectedDeductBalance < 0 ? '#fca5a5' : '#e2e8f0'}`, padding: '14px 16px', borderRadius: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Deduction Amount:</span>
                <span style={{ fontWeight: 900, color: '#dc2626', fontSize: '18px' }}>-{numericDeductPoints} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: projectedDeductBalance < 0 ? '#b91c1c' : 'var(--text-muted)' }}>
                <span>Remaining Balance:</span>
                <span><strong>{Math.max(0, projectedDeductBalance).toLocaleString()} pts</strong></span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deduction Reason (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Return / Correction"
                value={deductDesc}
                onChange={(e) => setDeductDesc(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              style={{ width: '100%', padding: '12px' }}
              disabled={deducting || !selectedMember || numericDeductPoints <= 0 || numericDeductPoints > (selectedMember?.points || 0)}
            >
              <FaMinusCircle /> {deducting ? 'Processing Deduction...' : `Deduct ${numericDeductPoints} Points`}
            </button>
          </form>
        </div>

      </div>

      {/* Earn Confirmation Modal */}
      {showEarnConfirm && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#16a34a' }}>
                <FaPlusCircle /> Confirm Add Points
              </h3>
              <button className="modal-close-btn" onClick={() => setShowEarnConfirm(false)}>
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              You are about to issue loyalty points to <strong>{selectedMember.fullName}</strong>.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Purchase Bill:</span>
                <strong>₹{parseFloat(billAmount).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Points to Add:</span>
                <strong style={{ color: '#16a34a' }}>+{calculatedEarnPoints} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>New Total Balance:</span>
                <strong>{projectedEarnBalance.toLocaleString()} pts</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEarnConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }} onClick={confirmEarnSubmit}>
                Confirm & Issue Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Confirmation Modal */}
      {showDeductConfirm && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#dc2626' }}>
                <FaMinusCircle /> Confirm Deduct Points
              </h3>
              <button className="modal-close-btn" onClick={() => setShowDeductConfirm(false)}>
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Are you sure you want to deduct points from <strong>{selectedMember.fullName}</strong>?
            </p>

            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Deduction Amount:</span>
                <strong style={{ color: '#dc2626' }}>-{numericDeductPoints} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Remaining Balance:</span>
                <strong>{projectedDeductBalance.toLocaleString()} pts</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeductConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeductSubmit}>
                Confirm Deduction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Recent Transactions History */}
      {selectedMember && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaHistory style={{ color: 'var(--primary)' }} /> Customer Audit History ({selectedMember.fullName})
            </h3>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Points</th>
                  <th>New Balance</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {loadingTx ? (
                  <TableRowSkeleton rows={3} cols={6} />
                ) : customerTransactions.length > 0 ? (
                  customerTransactions.map((t) => (
                    <tr key={t.transactionId}>
                      <td>#{t.transactionId}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.transactionDate ? new Date(t.transactionDate).toLocaleString() : 'N/A'}</td>
                      <td>
                        <span className={`badge ${t.transactionType === 'EARN' ? 'badge-active' : t.transactionType === 'REDEEM' ? 'badge-platinum' : 'badge-inactive'}`}>
                          {t.transactionType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: t.transactionType === 'EARN' ? '#16a34a' : '#dc2626' }}>
                        {t.transactionType === 'EARN' ? '+' : '-'}{t.points} pts
                      </td>
                      <td style={{ fontWeight: 700 }}>{t.newBalance ?? '-'} pts</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <EmptyState
                        icon={<FaHistory />}
                        title="No Audit History"
                        subtitle={`No transactions found for ${selectedMember.fullName}.`}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
