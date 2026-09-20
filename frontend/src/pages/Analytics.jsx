import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaChartLine, FaCoins, FaUsers, FaGift, FaRedo, FaShieldAlt, FaClock, FaAward, FaCalendarAlt, FaExchangeAlt, FaFire, FaCommentAlt, FaStar, FaThumbsUp, FaThumbsDown, FaMeh } from 'react-icons/fa';
import { StatCardSkeleton } from '../components/SkeletonLoader';

export const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalyticsData = async (rangeStr = timeRange) => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, trendRes, fbRes] = await Promise.all([
        apiFetch('/api/analytics/summary'),
        apiFetch(`/api/analytics/points-trend?range=${rangeStr}`),
        apiFetch('/api/feedback/analytics').catch(() => null)
      ]);
      setSummary(sumRes || {});
      setTrendData(trendRes || []);
      setFeedbackAnalytics(fbRes || null);
    } catch (err) {
      setError(err.message || 'Failed to load executive business analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData(timeRange);
  }, [timeRange]);

  const totalCust = summary?.totalCustomers || 0;
  const activeCust = summary?.activeCustomers || 0;
  const ptsIssued = summary?.totalPointsIssued || 0;
  const ptsRedeemed = summary?.totalPointsRedeemed || 0;
  const ptsExpired = summary?.totalPointsExpired || 0;
  const rewardsRedeemed = summary?.totalRewardsRedeemed || 0;
  const redemptionRate = summary?.redemptionRate || 0.0;
  const avgPts = summary?.avgCustomerPoints || 0;

  const countBronze = summary?.countBronze || 0;
  const countSilver = summary?.countSilver || 0;
  const countGold = summary?.countGold || 0;
  const countPlatinum = summary?.countPlatinum || 0;

  const expiring7 = summary?.pointsExpiring7Days || 0;
  const expiring30 = summary?.pointsExpiring30Days || 0;
  const totalFraud = summary?.totalFraudIncidents || 0;
  const highRiskFraud = summary?.highRiskCases || 0;

  const maxTrendVal = Math.max(1, ...trendData.flatMap(t => [t.earned || 0, t.redeemed || 0, t.expired || 0]));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaChartLine style={{ color: 'var(--primary)' }} />
            Executive Loyalty Analytics
          </h1>
          <p className="page-subtitle">Real-time program metrics, points velocity, expiry liabilities, and risk intelligence.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <FaCalendarAlt style={{ color: 'var(--primary)' }} />
            <select
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '13px', cursor: 'pointer', outline: 'none' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="1y">This Year (1 Year)</option>
            </select>
          </div>

          <button onClick={() => loadAnalyticsData(timeRange)} className="btn btn-secondary">
            <FaRedo className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* 8 Executive Summary Cards */}
      {loading ? (
        <StatCardSkeleton count={8} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Customers</span>
              <div className="stat-icon-wrapper">
                <FaUsers />
              </div>
            </div>
            <div className="stat-value">{totalCust.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeCust} Active Members</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Issued</span>
              <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <FaCoins />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#16a34a' }}>+{ptsIssued.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cumulative Earned</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Redeemed</span>
              <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                <FaGift />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#d97706' }}>-{ptsRedeemed.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rewardsRedeemed} Rewards Claimed</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Expired</span>
              <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <FaClock />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{ptsExpired.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{expiring30.toLocaleString()} Expiring (30d)</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Redemption Rate</span>
              <div className="stat-icon-wrapper">
                <FaChartLine />
              </div>
            </div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{redemptionRate}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Redeemed vs Issued Ratio</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Avg Customer Balance</span>
              <div className="stat-icon-wrapper" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <FaCoins />
              </div>
            </div>
            <div className="stat-value">{avgPts.toLocaleString()} pts</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Per Customer Average</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Expiring in 7 Days</span>
              <div className="stat-icon-wrapper" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                <FaFire />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#e11d48' }}>{expiring7.toLocaleString()} pts</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Critical Expiry Risk</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Fraud Incidents</span>
              <div className="stat-icon-wrapper" style={{ background: highRiskFraud > 0 ? '#fee2e2' : '#dcfce7', color: highRiskFraud > 0 ? '#dc2626' : '#16a34a' }}>
                <FaShieldAlt />
              </div>
            </div>
            <div className="stat-value" style={{ color: highRiskFraud > 0 ? '#dc2626' : 'var(--text-main)' }}>{totalFraud}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{highRiskFraud} High Risk Cases</div>
          </div>
        </div>
      )}

      {/* Points Velocity Trend Chart */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <FaChartLine style={{ color: 'var(--primary)' }} /> Points Flow Velocity Trend ({timeRange})
          </h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>🟢 Earned</span>
            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>🟠 Redeemed</span>
            <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>🔴 Expired</span>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
          <div style={{ minWidth: '600px', height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '30px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
            {trendData.map((d, idx) => {
              const eH = Math.max(8, (d.earned / maxTrendVal) * 160);
              const rH = Math.max(8, (d.redeemed / maxTrendVal) * 160);
              const xH = Math.max(8, (d.expired / maxTrendVal) * 160);

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px' }}>
                    <div title={`Earned: ${d.earned}`} style={{ width: '12px', height: `${eH}px`, background: '#16a34a', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }}></div>
                    <div title={`Redeemed: ${d.redeemed}`} style={{ width: '12px', height: `${rH}px`, background: '#d97706', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }}></div>
                    <div title={`Expired: ${d.expired}`} style={{ width: '12px', height: `${xH}px`, background: '#dc2626', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }}></div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{d.date || d.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tier Distribution & Feedback Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaAward style={{ color: 'var(--primary)' }} /> Customer Tier Distribution
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                <span>BRONZE TIER (&lt;1000)</span>
                <span>{countBronze} members</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#fef3c7', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalCust > 0 ? (countBronze / totalCust) * 100 : 0}%`, background: '#b45309' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                <span>SILVER TIER (&ge;1000)</span>
                <span>{countSilver} members</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalCust > 0 ? (countSilver / totalCust) * 100 : 0}%`, background: '#475569' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                <span>GOLD TIER (&ge;2500)</span>
                <span>{countGold} members</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#fffbeb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalCust > 0 ? (countGold / totalCust) * 100 : 0}%`, background: '#d97706' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                <span>PLATINUM TIER (&ge;5000)</span>
                <span>{countPlatinum} members</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#f3e8ff', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalCust > 0 ? (countPlatinum / totalCust) * 100 : 0}%`, background: '#7c3aed' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Sentiment & Feedback Analytics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaCommentAlt style={{ color: 'var(--primary)' }} /> Customer Sentiment & Feedback Telemetry
            </h3>
          </div>
          {feedbackAnalytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>CSAT AVERAGE RATING</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#f59e0b' }}>
                    ★ {feedbackAnalytics.avgRating ?? 0.0} / 5.0
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>POSITIVE SENTIMENT</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a' }}>
                    {feedbackAnalytics.positivePercentage ?? 0}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlignment: 'center', marginTop: '4px' }}>
                <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                  <FaThumbsUp style={{ color: '#16a34a', fontSize: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>{feedbackAnalytics.positiveCount ?? 0}</div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>Positive</div>
                </div>

                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                  <FaMeh style={{ color: '#475569', fontSize: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155' }}>{feedbackAnalytics.neutralCount ?? 0}</div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Neutral</div>
                </div>

                <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                  <FaThumbsDown style={{ color: '#dc2626', fontSize: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#991b1b' }}>{feedbackAnalytics.negativeCount ?? 0}</div>
                  <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700 }}>Negative</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Feedback analytics data loading or unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
