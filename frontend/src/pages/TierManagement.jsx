import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaAward, FaUsers, FaRedo, FaCheckCircle } from 'react-icons/fa';

export const TierManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTierData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/members');
      setMembers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load member tier metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTierData();
  }, []);

  const countBronze = members.filter((m) => m.tier === 'BRONZE').length;
  const countSilver = members.filter((m) => m.tier === 'SILVER').length;
  const countGold = members.filter((m) => m.tier === 'GOLD').length;
  const countPlatinum = members.filter((m) => m.tier === 'PLATINUM').length;
  const total = members.length || 1;

  const tiersConfig = [
    { name: 'BRONZE', rule: '0 - 999 Points', minPts: 0, count: countBronze, badgeClass: 'badge-bronze', desc: 'Entry-level loyalty status. Basic rewards access.' },
    { name: 'SILVER', rule: '1,000 - 2,499 Points', minPts: 1000, count: countSilver, badgeClass: 'badge-silver', desc: 'Silver tier unlock: 5% bonus point earning rate.' },
    { name: 'GOLD', rule: '2,500 - 4,999 Points', minPts: 2500, count: countGold, badgeClass: 'badge-gold', desc: 'Gold tier unlock: Priority redemption & exclusive partner deals.' },
    { name: 'PLATINUM', rule: '5,000+ Points', minPts: 5000, count: countPlatinum, badgeClass: 'badge-platinum', desc: 'Top tier VIP status: Dedicated concierge & maximum point multiplier.' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tier Management</h1>
          <p className="page-subtitle">Configure tier progression thresholds and monitor active member tier distribution.</p>
        </div>
        <button onClick={loadTierData} className="btn btn-secondary">
          <FaRedo /> Refresh Distribution
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {tiersConfig.map((t) => {
          const percent = Math.round((t.count / total) * 100);
          return (
            <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className={`badge ${t.badgeClass}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                    <FaAward /> {t.name}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{t.rule}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{t.desc}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Active Members</span>
                  <span style={{ fontSize: '16px', fontWeight: 800 }}>{t.count} ({percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Backend Tier Calculation Engine</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Loyalty tiers are evaluated automatically on the Spring Boot backend during every point transaction (Earn, Deduct, Redeem). Tier definitions cannot be overridden manually by frontend requests to ensure system integrity.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#166534', background: '#f0fdf4', padding: '10px 16px', borderRadius: '8px', border: '1px solid #86efac' }}>
            <FaCheckCircle /> Automatic Real-Time Calculation Enabled
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1e40af', background: '#eff6ff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <FaUsers /> Total Monitored Accounts: {members.length}
          </div>
        </div>
      </div>
    </div>
  );
};
