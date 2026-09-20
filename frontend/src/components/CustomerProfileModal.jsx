import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  FaUserAlt,
  FaStar,
  FaCoins,
  FaExchangeAlt,
  FaTimes,
  FaHistory,
  FaPlusCircle,
  FaMinusCircle,
  FaGift,
  FaClock,
  FaUserCheck,
  FaReceipt,
  FaTrophy
} from 'react-icons/fa';
import { LoyaltyJourney } from './LoyaltyJourney';

export const CustomerProfileModal = ({ isOpen, onClose, member }) => {
  const navigate = useNavigate();
  const { role: currentUserRole } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState('');

  const isStaff = currentUserRole === 'STAFF';

  useEffect(() => {
    if (isOpen && member?.memberId) {
      if (isStaff && member.role && member.role !== 'CUSTOMER') {
        setTxError('Access Restricted: STAFF users can view transaction history for CUSTOMER accounts only.');
        setTransactions([]);
        return;
      }

      setTxError('');
      setLoadingTx(true);
      apiFetch('/api/transactions')
        .then((allTx) => {
          const targetId = member.memberId;
          const filtered = (allTx || []).filter(
            (t) => (t.memberId === targetId) || (t.member && t.member.memberId === targetId) || (t.customerId === targetId)
          );
          filtered.sort((a, b) => (b.transactionId || 0) - (a.transactionId || 0));
          setTransactions(filtered);
        })
        .catch((err) => {
          setTxError(err.message || 'Failed to load transaction history.');
          setTransactions([]);
        })
        .finally(() => setLoadingTx(false));
    }
  }, [isOpen, member, isStaff]);

  if (!isOpen || !member) return null;

  const renderTierBadge = (tier) => {
    const cls = `badge badge-${tier?.toLowerCase() || 'bronze'}`;
    return (
      <span className={cls} style={{ fontSize: '13px', padding: '5px 12px', fontWeight: 800 }}>
        <FaStar style={{ marginRight: '4px' }} /> {tier || 'BRONZE'} TIER
      </span>
    );
  };

  const formatTxDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return String(dateStr);
    }
  };

  const renderTxBadge = (type) => {
    switch (type) {
      case 'EARN':
        return (
          <span className="badge badge-active" style={{ fontSize: '10px' }}>
            <FaPlusCircle /> EARN
          </span>
        );
      case 'DEDUCT':
        return (
          <span className="badge badge-gold" style={{ fontSize: '10px' }}>
            <FaMinusCircle /> DEDUCT
          </span>
        );
      case 'REDEEM':
        return (
          <span className="badge badge-platinum" style={{ fontSize: '10px' }}>
            <FaGift /> REDEEM
          </span>
        );
      case 'EXPIRED':
      case 'EXPIRE':
        return (
          <span className="badge badge-inactive" style={{ fontSize: '10px' }}>
            <FaClock /> EXPIRED
          </span>
        );
      default:
        return <span className="badge badge-silver" style={{ fontSize: '10px' }}>{type}</span>;
    }
  };

  const handleNavigateEarnPoints = () => {
    onClose();
    navigate('/earn-points');
  };

  const handleNavigateLedger = () => {
    onClose();
    navigate('/ledger');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Header Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                boxShadow: 'var(--accent-glow)',
                flexShrink: 0
              }}
            >
              {member.fullName ? member.fullName[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', lineHeight: '1.2' }}>
                {member.fullName}
              </div>
              <div style={{ marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className={`badge ${member.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                  <span className="badge-dot"></span>{member.status || 'ACTIVE'}
                </span>
                <span className="badge badge-role" style={{ fontSize: '10px' }}>
                  {member.role || 'CUSTOMER'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close Profile Modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Customer Basic Info */}
        <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '14px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Customer ID</div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>#{member.memberId}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.phone || 'N/A'}</div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>{member.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div>
              {renderTierBadge(member.tier)}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', lineHeight: '1' }}>
                {(member.points || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                AVAILABLE POINTS
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Journey & Achievements Component */}
        <LoyaltyJourney
          points={member.points || 0}
          transactions={transactions}
          tier={member.tier}
        />

        {/* Transaction Audit History Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaHistory style={{ color: 'var(--primary)' }} /> TRANSACTION HISTORY
            </div>
            {transactions.length > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Showing recent {transactions.length} record{transactions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {txError ? (
            <div className="alert-error" style={{ fontSize: '13px', padding: '10px 14px' }}>
              {txError}
            </div>
          ) : loadingTx ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px', textAlign: 'center' }}>
              Loading transaction history audit log...
            </div>
          ) : transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              {transactions.map((tx) => {
                const isEarn = tx.transactionType === 'EARN';
                const isDeduct = tx.transactionType === 'DEDUCT';
                const pointColor = isEarn ? '#16a34a' : isDeduct ? '#d97706' : '#dc2626';

                return (
                  <div
                    key={tx.transactionId}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>#{tx.transactionId}</span>
                        {renderTxBadge(tx.transactionType)}
                      </div>

                      <div style={{ fontWeight: 900, fontSize: '14px', color: pointColor }}>
                        {isEarn ? '+' : '-'}{tx.points} pts
                      </div>
                    </div>

                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                      {tx.description || `${tx.transactionType} Transaction`}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Balance: {tx.previousBalance ?? '-'} &rarr; <strong>{tx.newBalance ?? '-'} pts</strong></span>
                      <span>{formatTxDate(tx.transactionDate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              No previous point transactions found for this customer.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleNavigateEarnPoints}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '130px' }}
          >
            <FaCoins /> Manage Points
          </button>
          <button
            onClick={handleNavigateLedger}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '130px' }}
          >
            <FaExchangeAlt /> View Full History
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileModal;
