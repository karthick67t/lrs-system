import React from 'react';

/**
 * Skeleton Loader Component with support for Stat Cards, Table Rows, and Cards
 */
export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="stat-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="stat-card">
          <div className="stat-card-top">
            <div className="skeleton skeleton-avatar" style={{ width: '40px', height: '40px' }}></div>
            <div className="skeleton" style={{ width: '60px', height: '14px' }}></div>
          </div>
          <div className="skeleton skeleton-title" style={{ width: '70%', height: '32px', marginTop: '12px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px' }}></div>
        </div>
      ))}
    </div>
  );
};

export const TableRowSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx}>
              <div
                className="skeleton skeleton-text"
                style={{
                  width: cIdx === 0 ? '70%' : cIdx === cols - 1 ? '40%' : '85%',
                  height: '16px',
                  marginBottom: 0
                }}
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card">
          <div className="skeleton skeleton-title" style={{ width: '80%', height: '22px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '100%', height: '14px', marginTop: '12px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '60%', height: '14px', marginTop: '8px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '38px', marginTop: '20px', borderRadius: '10px' }}></div>
        </div>
      ))}
    </div>
  );
};

export default { StatCardSkeleton, TableRowSkeleton, CardSkeleton };
