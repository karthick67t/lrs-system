import React from 'react';
import { FaStar, FaTrophy } from 'react-icons/fa';

/**
 * Calculates tier progress based on current points.
 * Tier thresholds:
 * BRONZE: 0 - 999 points
 * SILVER: 1000 - 2499 points
 * GOLD: 2500 - 4999 points
 * PLATINUM: 5000+ points
 */
export const getTierProgress = (points = 0) => {
  const currentPoints = Math.max(0, points);

  if (currentPoints >= 5000) {
    return {
      currentTier: 'PLATINUM',
      nextTier: null,
      pointsNeeded: 0,
      percentage: 100,
      isMaxTier: true,
      message: 'Congratulations! You have reached the highest tier.',
    };
  }

  if (currentPoints >= 2500) {
    const minPts = 2500;
    const maxPts = 5000;
    const pointsNeeded = maxPts - currentPoints;
    const percentage = Math.min(100, Math.max(0, ((currentPoints - minPts) / (maxPts - minPts)) * 100));
    return {
      currentTier: 'GOLD',
      nextTier: 'PLATINUM',
      pointsNeeded,
      percentage: Math.round(percentage),
      isMaxTier: false,
      message: 'Keep earning to reach PLATINUM!',
    };
  }

  if (currentPoints >= 1000) {
    const minPts = 1000;
    const maxPts = 2500;
    const pointsNeeded = maxPts - currentPoints;
    const percentage = Math.min(100, Math.max(0, ((currentPoints - minPts) / (maxPts - minPts)) * 100));
    return {
      currentTier: 'SILVER',
      nextTier: 'GOLD',
      pointsNeeded,
      percentage: Math.round(percentage),
      isMaxTier: false,
      message: 'Keep earning to reach GOLD!',
    };
  }

  // BRONZE (0 to 999)
  const minPts = 0;
  const maxPts = 1000;
  const pointsNeeded = maxPts - currentPoints;
  const percentage = Math.min(100, Math.max(0, (currentPoints / maxPts) * 100));
  return {
    currentTier: 'BRONZE',
    nextTier: 'SILVER',
    pointsNeeded,
    percentage: Math.round(percentage),
    isMaxTier: false,
    message: 'Keep earning to reach SILVER!',
  };
};

export const TierProgressCard = ({ points = 0 }) => {
  const progressInfo = getTierProgress(points);
  const { currentTier, nextTier, pointsNeeded, percentage, isMaxTier, message } = progressInfo;

  const getTierColor = (t) => {
    switch (t) {
      case 'PLATINUM': return '#7c3aed';
      case 'GOLD': return '#d97706';
      case 'SILVER': return '#475569';
      default: return '#b45309'; // BRONZE
    }
  };

  const currentTierColor = getTierColor(currentTier);

  return (
    <div className="card" style={{ marginBottom: '28px', borderLeft: `5px solid ${currentTierColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: currentTierColor }}>
          <FaStar /> {currentTier} MEMBER
        </div>
        <span className={`badge badge-${currentTier.toLowerCase()}`} style={{ fontSize: '12px' }}>
          {percentage}% Progress
        </span>
      </div>

      <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '14px' }}>
        {points.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Points</span>
      </div>

      {!isMaxTier ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Next Tier: <strong>{nextTier}</strong>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>
              {pointsNeeded.toLocaleString()} points to go
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '14px',
              backgroundColor: '#e5e7eb',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '12px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                background: 'var(--accent-gradient)',
                borderRadius: '999px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {message}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              width: '100%',
              height: '14px',
              backgroundColor: '#e5e7eb',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                borderRadius: '999px'
              }}
            />
          </div>
          <div style={{ fontSize: '14px', color: '#7c3aed', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTrophy /> {message}
          </div>
        </>
      )}
    </div>
  );
};

export default TierProgressCard;
