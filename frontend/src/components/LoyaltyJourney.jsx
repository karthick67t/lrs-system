import React from 'react';
import { FaCheck, FaStar, FaLock, FaTrophy, FaCoins, FaFire, FaGift, FaAward } from 'react-icons/fa';
import { getTierProgress } from './TierProgressCard';

/**
 * Reusable Loyalty Journey & Achievement Badges Component
 * @param {Object} props
 * @param {number} props.points - Customer current points balance
 * @param {Array} [props.transactions=[]] - Real customer transaction audit records
 * @param {string} [props.tier] - Customer current tier (optional)
 */
export const LoyaltyJourney = ({ points = 0, transactions = [], tier }) => {
  const currentPts = Math.max(0, points || 0);
  const progressInfo = getTierProgress(currentPts);
  const currentTier = tier || progressInfo.currentTier;

  // Tiers threshold configuration
  const tiers = [
    { name: 'BRONZE', minPts: 0, maxPts: 999, label: '0 - 999 pts' },
    { name: 'SILVER', minPts: 1000, maxPts: 2499, label: '1,000 - 2,499 pts' },
    { name: 'GOLD', minPts: 2500, maxPts: 4999, label: '2,500 - 4,999 pts' },
    { name: 'PLATINUM', minPts: 5000, maxPts: Infinity, label: '5,000+ pts' },
  ];

  // Calculate timeline fill percentage across 4 nodes (3 intervals)
  let timelineFillPct = 0;
  if (currentPts >= 5000) {
    timelineFillPct = 100;
  } else if (currentPts >= 2500) {
    timelineFillPct = 66.6 + ((currentPts - 2500) / 2500) * 33.3;
  } else if (currentPts >= 1000) {
    timelineFillPct = 33.3 + ((currentPts - 1000) / 1500) * 33.3;
  } else {
    timelineFillPct = (currentPts / 1000) * 33.3;
  }

  timelineFillPct = Math.min(100, Math.max(0, timelineFillPct));

  // Compute total earned points from transactions
  const earnedTotal = transactions
    .filter((t) => t.transactionType === 'EARN')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const hasEarnTx = transactions.some((t) => t.transactionType === 'EARN') || currentPts > 0;
  const hasRedeemTx = transactions.some((t) => t.transactionType === 'REDEEM');
  const txCount = transactions.length;

  // Real data achievement badge criteria
  const achievements = [
    {
      id: 'first_purchase',
      icon: '🏁',
      title: 'First Purchase',
      desc: 'Earned loyalty points on first order',
      unlocked: hasEarnTx,
    },
    {
      id: 'point_collector',
      icon: '🪙',
      title: 'Point Collector',
      desc: 'Accumulated 1,000+ total points',
      unlocked: earnedTotal >= 1000 || currentPts >= 1000,
    },
    {
      id: 'active_customer',
      icon: '🔥',
      title: 'Active Customer',
      desc: 'Completed 10+ point transactions',
      unlocked: txCount >= 10,
    },
    {
      id: 'first_redemption',
      icon: '🎁',
      title: 'First Redemption',
      desc: 'Exchanged points for a reward',
      unlocked: hasRedeemTx,
    },
    {
      id: 'gold_member',
      icon: '⭐',
      title: 'Gold Member',
      desc: 'Reached GOLD tier status (2,500+ pts)',
      unlocked: currentTier === 'GOLD' || currentTier === 'PLATINUM' || currentPts >= 2500,
    },
    {
      id: 'platinum_member',
      icon: '💎',
      title: 'Platinum Member',
      desc: 'Reached top PLATINUM tier (5,000+ pts)',
      unlocked: currentTier === 'PLATINUM' || currentPts >= 5000,
    },
  ];

  return (
    <div className="loyalty-journey-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FaTrophy style={{ color: 'var(--primary)' }} /> Loyalty Journey & Tier Progress
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current Balance: <strong>{currentPts.toLocaleString()} pts</strong> &bull; Current Status: <strong>{currentTier} TIER</strong>
          </p>
        </div>

        {!progressInfo.isMaxTier ? (
          <span className="badge badge-active" style={{ fontSize: '12px', padding: '6px 14px' }}>
            {progressInfo.percentage}% to {progressInfo.nextTier} ({progressInfo.pointsNeeded.toLocaleString()} pts needed)
          </span>
        ) : (
          <span className="badge badge-platinum" style={{ fontSize: '12px', padding: '6px 14px' }}>
            👑 MAX TIER REACHED
          </span>
        )}
      </div>

      {/* Timeline Journey Graphic */}
      <div className="journey-timeline-wrapper">
        <div className="journey-timeline-track">
          <div className="journey-timeline-fill" style={{ width: `${timelineFillPct}%` }}></div>
        </div>

        {tiers.map((tStep) => {
          const isCurrent = currentTier === tStep.name;
          const isCompleted = currentPts >= tStep.minPts && !isCurrent;
          const isUpcoming = currentPts < tStep.minPts;

          let stepStatusClass = 'upcoming';
          if (isCurrent) stepStatusClass = 'current';
          else if (isCompleted) stepStatusClass = 'completed';

          return (
            <div key={tStep.name} className={`journey-node-step ${stepStatusClass}`}>
              <div className="journey-node-icon">
                {isCompleted ? (
                  <FaCheck />
                ) : isCurrent ? (
                  <FaStar />
                ) : (
                  <FaLock style={{ fontSize: '14px' }} />
                )}
              </div>
              <div className="journey-node-label">
                {tStep.name}
                {isCurrent && <div style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase' }}>CURRENT</div>}
              </div>
              <div className="journey-node-points">{tStep.label}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar Detail */}
      {!progressInfo.isMaxTier && (
        <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
            <span>Progress to {progressInfo.nextTier}: {progressInfo.percentage}%</span>
            <span style={{ color: 'var(--primary)' }}>{progressInfo.pointsNeeded.toLocaleString()} points needed</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressInfo.percentage}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '999px', transition: 'width 0.6s ease' }}></div>
          </div>
        </div>
      )}

      {/* Achievements Badges Section */}
      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaAward style={{ color: '#d97706' }} /> Achievements & Badges ({achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked)
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Unlock exclusive milestone badges as you earn points and participate in the loyalty program.
        </p>

        <div className="achievement-grid">
          {achievements.map((ach) => (
            <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon-wrapper">
                {ach.unlocked ? ach.icon : '🔒'}
              </div>
              <div>
                <div className="achievement-title">{ach.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {ach.desc}
                </div>
              </div>
              <div className="achievement-status-badge">
                {ach.unlocked ? '✓ Unlocked' : 'Locked'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyJourney;
