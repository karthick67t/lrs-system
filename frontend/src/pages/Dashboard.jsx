import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import {
  FaUsers,
  FaGift,
  FaCoins,
  FaUserCheck,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaRedo,
  FaPlusCircle,
  FaChartLine,
  FaAward,
  FaUserAlt,
  FaLock,
  FaClock,
  FaCommentAlt,
  FaStar,
  FaHistory,
  FaCalendarAlt,
  FaUserPlus,
  FaCheckCircle,
  FaChevronRight,
  FaMinusCircle,
  FaReceipt
} from 'react-icons/fa';
import { FeedbackModal } from '../components/FeedbackModal';
import { TierProgressCard } from '../components/TierProgressCard';
import EmptyState from '../components/EmptyState';
import { StatCardSkeleton, TableRowSkeleton } from '../components/SkeletonLoader';

export const Dashboard = () => {
  const { user, role, memberId } = useAuth();
  const normalizedRole = role ? (String(role).toUpperCase().trim().startsWith('ROLE_') ? String(role).toUpperCase().trim().substring(5) : String(role).toUpperCase().trim()) : null;
  const isCustomer = normalizedRole === 'CUSTOMER';
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';
  const isManager = normalizedRole === 'LOYALTY_MANAGER';
  const isStaff = normalizedRole === 'STAFF';

  const [members, setMembers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [myMemberDetails, setMyMemberDetails] = useState(null);
  const [expiryInfo, setExpiryInfo] = useState(null);
  const [myFeedback, setMyFeedback] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isCustomer) {
        const [meData, rewardsData, txData, feedbackData] = await Promise.all([
          apiFetch('/api/members/me').catch(() => null),
          apiFetch('/api/rewards').catch(() => []),
          apiFetch('/api/transactions/me').catch(() => []),
          apiFetch('/api/feedback/my').catch(() => []),
        ]);
        setMyMemberDetails(meData);
        setRewards(rewardsData || []);
        setTransactions(txData || []);
        setMyFeedback(feedbackData || []);

        const targetId = meData?.memberId || memberId;
        if (targetId) {
          const expData = await apiFetch(`/api/points-expiry/customer/${targetId}`).catch(() => null);
          setExpiryInfo(expData);
        }
      } else {
        const [membersData, rewardsData, transactionsData] = await Promise.all([
          apiFetch('/api/members').catch(() => []),
          apiFetch('/api/rewards').catch(() => []),
          apiFetch('/api/transactions').catch(() => []),
        ]);
        setMembers(membersData || []);
        setRewards(rewardsData || []);
        setTransactions(transactionsData || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderTierBadge = (tier) => {
    const cls = `badge badge-${tier?.toLowerCase() || 'bronze'}`;
    return <span className={cls} style={{ fontSize: '13px', padding: '5px 12px' }}><FaAward /> {tier || 'BRONZE'} TIER</span>;
  };

  // Real data Today's Overview calculations
  const todayStr = new Date().toDateString();
  const todayTransactions = transactions.filter((t) => {
    if (!t.transactionDate) return false;
    return new Date(t.transactionDate).toDateString() === todayStr;
  });

  const todayPointsEarned = todayTransactions
    .filter((t) => t.transactionType === 'EARN')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const todayRedemptionsCount = todayTransactions
    .filter((t) => t.transactionType === 'REDEEM').length;

  const todayActiveCustomersCount = new Set(
    todayTransactions
      .map((t) => t.memberId || t.customerId || (t.member && t.member.memberId))
      .filter(Boolean)
  ).size;

  const formatActivityTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      const isToday = d.toDateString() === todayStr;
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return isToday ? `Today, ${timeStr}` : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
    } catch (e) {
      return 'Recently';
    }
  };

  // CUSTOMER Dashboard View
  if (isCustomer) {
    const currentPoints = myMemberDetails?.points ?? user?.points ?? 0;
    const currentTier = myMemberDetails?.tier ?? user?.tier ?? 'BRONZE';

    const myEarned = transactions
      .filter((t) => t.transactionType === 'EARN')
      .reduce((sum, t) => sum + (t.points || 0), 0);

    const myRedeemed = transactions
      .filter((t) => t.transactionType === 'REDEEM')
      .reduce((sum, t) => sum + (t.points || 0), 0);

    const affordableCount = rewards.filter((r) => r.pointsRequired <= currentPoints && r.stock > 0).length;

    return (
      <div className="page-container">
        {/* Premium Welcome Header */}
        <div className="welcome-header-card">
          <div>
            <h1 className="welcome-user-greeting">
              {getGreeting()}, {user?.fullName || 'Valued Member'} 👋
            </h1>
            <p className="welcome-subtext">
              Track your reward points balance, view tier status, and redeem exciting rewards.
            </p>
          </div>

          <div className="welcome-right-meta">
            <div className="welcome-date-badge">
              <FaCalendarAlt style={{ color: 'var(--primary)' }} /> {formattedDate}
            </div>
            <div className="welcome-user-avatar">
              {getInitials(user?.fullName)}
            </div>
            <span className="badge badge-role">CUSTOMER</span>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Security Warning for Default Pass */}
        {myMemberDetails?.phone && (myMemberDetails?.password === myMemberDetails?.phone || myMemberDetails?.defaultPassword || user?.defaultPassword) && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fffbebfd', border: '1px solid #fde68a', borderRadius: '14px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaLock style={{ fontSize: '22px', color: '#d97706', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, color: '#92400e', fontSize: '15px' }}>Security Action Required: Change Initial Password</div>
                <div style={{ fontSize: '13px', color: '#b45309' }}>You are currently logged in with your default phone number password. Please set a new password.</div>
              </div>
            </div>
            <Link to="/profile" className="btn btn-warning" style={{ backgroundColor: '#d97706', color: 'white', border: 'none', padding: '10px 18px', fontWeight: 700 }}>
              Change Password Now
            </Link>
          </div>
        )}

        {/* Role-Authorized Quick Actions Bar */}
        <div className="card" style={{ marginBottom: '28px', padding: '20px 24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/rewards" className="btn btn-primary">
              <FaGift /> Browse Catalog ({affordableCount} Affordable)
            </Link>
            <Link to="/ledger" className="btn btn-secondary">
              <FaExchangeAlt /> View Transactions
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              <FaUserAlt /> My Profile
            </Link>
            <button onClick={() => setShowFeedbackModal(true)} className="btn btn-secondary" style={{ color: '#d97706' }}>
              <FaCommentAlt /> Give Feedback (+5 Pts)
            </button>
          </div>
        </div>

        {/* Customer KPI Balance Banner */}
        <div className="card" style={{ marginBottom: '28px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>MY CURRENT BALANCE</div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--primary)', margin: '4px 0', letterSpacing: '-0.5px' }}>
                {currentPoints.toLocaleString()} <span style={{ fontSize: '20px', fontWeight: 600 }}>pts</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                {renderTierBadge(currentTier)}
                <span className="badge badge-active"><span className="badge-dot"></span>ACCOUNT {myMemberDetails?.status || 'ACTIVE'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={loadDashboardData} className="btn btn-secondary">
                <FaRedo className={loading ? 'spin' : ''} /> Refresh Account
              </button>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <TierProgressCard points={currentPoints} />

        {/* Expiry Warning Banner */}
        {expiryInfo && expiryInfo.totalExpiringSoon > 0 && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '14px', marginBottom: '28px', color: '#be123c', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <FaClock style={{ fontSize: '24px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Upcoming Points Expiry Warning</div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                You have <strong>{expiryInfo.totalExpiringSoon} points</strong> expiring within 30 days (Next expiry: <strong>{expiryInfo.nextExpiryDate ? new Date(expiryInfo.nextExpiryDate).toLocaleDateString() : 'N/A'}</strong>). Redeem before they expire!
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Timeline Cards */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <FaHistory style={{ color: 'var(--primary)' }} /> Recent Activity & Point History
            </h3>
            <Link to="/ledger" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>
              View Audit Log &rarr;
            </Link>
          </div>

          <div className="activity-timeline-list">
            {loading ? (
              <TableRowSkeleton rows={3} cols={4} />
            ) : transactions.length > 0 ? (
              transactions.slice(0, 5).map((t) => {
                const isEarn = t.transactionType === 'EARN';
                const isRedeem = t.transactionType === 'REDEEM';
                const iconClass = isEarn ? 'earn' : isRedeem ? 'redeem' : 'deduct';

                return (
                  <div key={t.transactionId} className="activity-timeline-item">
                    <div className="activity-item-left">
                      <div className={`activity-item-icon ${iconClass}`}>
                        {isEarn ? <FaCoins /> : isRedeem ? <FaGift /> : <FaMinusCircle />}
                      </div>
                      <div className="activity-item-details">
                        <div className="activity-item-desc">
                          {t.description || `${t.transactionType} Transaction`}
                        </div>
                        <div className="activity-item-sub">
                          Tx #{t.transactionId} &bull; Performed by {t.performedByName || 'System'}
                        </div>
                      </div>
                    </div>

                    <div className="activity-item-right">
                      <div className={`activity-pts-val ${isEarn ? 'positive' : 'negative'}`}>
                        {isEarn ? '+' : '-'}{t.points} pts
                      </div>
                      <div className="activity-time-text">{formatActivityTime(t.transactionDate)}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={<FaHistory />}
                title="No Activity Recorded"
                subtitle="You haven't completed any transactions yet."
              />
            )}
          </div>
        </div>

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => loadDashboardData()}
          rewards={rewards}
          transactions={transactions}
        />
      </div>
    );
  }

  // Staff / Loyalty Manager / Super Admin Dashboard
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
  const totalRewards = rewards.length;
  const totalPointsBalance = members.reduce((sum, m) => sum + (m.points || 0), 0);

  const totalPointsEarned = transactions
    .filter((t) => t.transactionType === 'EARN')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const totalPointsDeducted = transactions
    .filter((t) => t.transactionType === 'DEDUCT')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const totalPointsRedeemed = transactions
    .filter((t) => t.transactionType === 'REDEEM')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const recentMembers = members.slice(-5).reverse();
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="page-container">
      {/* Premium Welcome Header */}
      <div className="welcome-header-card">
        <div>
          <h1 className="welcome-user-greeting">
            {getGreeting()}, {user?.fullName || 'User'} 👋
          </h1>
          <p className="welcome-subtext">
            Here's what's happening with your loyalty platform today.
          </p>
        </div>

        <div className="welcome-right-meta">
          <div className="welcome-date-badge">
            <FaCalendarAlt style={{ color: 'var(--primary)' }} /> {formattedDate}
          </div>
          <div className="welcome-user-avatar">
            {getInitials(user?.fullName)}
          </div>
          <span className="badge badge-role">{normalizedRole}</span>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Role-Aware Quick Actions Bar */}
      <div className="card" style={{ marginBottom: '28px', padding: '20px 24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {isSuperAdmin && (
            <>
              <Link to="/members?action=add-customer" className="btn btn-primary">
                <FaUserPlus /> Add Member
              </Link>
              <Link to="/rewards" className="btn btn-secondary">
                <FaPlusCircle /> Add Reward
              </Link>
              <Link to="/complaints" className="btn btn-secondary">
                <FaCommentAlt /> View Complaints
              </Link>
              <Link to="/analytics" className="btn btn-secondary">
                <FaChartLine /> View Reports
              </Link>
            </>
          )}

          {isManager && (
            <>
              <Link to="/members?action=add-customer" className="btn btn-primary">
                <FaUserPlus /> Add Customer
              </Link>
              <Link to="/earn-points" className="btn btn-secondary">
                <FaCoins /> Manage Points
              </Link>
              <Link to="/rewards" className="btn btn-secondary">
                <FaPlusCircle /> Add Reward
              </Link>
              <Link to="/analytics" className="btn btn-secondary">
                <FaChartLine /> Analytics
              </Link>
            </>
          )}

          {isStaff && (
            <>
              <Link to="/members?action=add-customer" className="btn btn-primary">
                <FaUserPlus /> Add Customer
              </Link>
              <Link to="/earn-points" className="btn btn-secondary">
                <FaCoins /> Issue / Deduct Points
              </Link>
              <Link to="/members" className="btn btn-secondary">
                <FaUsers /> View Customers
              </Link>
            </>
          )}

          <button onClick={loadDashboardData} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
            <FaRedo className={loading ? 'spin' : ''} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Today's Overview Section */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaClock style={{ color: 'var(--primary)' }} /> Today's Overview ({new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })})
        </h3>

        <div className="today-overview-grid">
          <div className="today-overview-card">
            <div>
              <div className="today-card-label">Points Earned Today</div>
              <div className="today-card-val" style={{ color: '#16a34a' }}>
                +{todayPointsEarned.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 600 }}>pts</span>
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <FaCoins />
            </div>
          </div>

          <div className="today-overview-card">
            <div>
              <div className="today-card-label">Redemptions Today</div>
              <div className="today-card-val" style={{ color: '#d97706' }}>
                {todayRedemptionsCount} <span style={{ fontSize: '14px', fontWeight: 600 }}>Claimed</span>
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
              <FaGift />
            </div>
          </div>

          <div className="today-overview-card">
            <div>
              <div className="today-card-label">Active Customers Today</div>
              <div className="today-card-val" style={{ color: 'var(--primary)' }}>
                {todayActiveCustomersCount} <span style={{ fontSize: '14px', fontWeight: 600 }}>Active</span>
              </div>
            </div>
            <div className="stat-icon-wrapper">
              <FaUserCheck />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cumulative Stats Grid */}
      {loading ? (
        <StatCardSkeleton count={8} />
      ) : (
        <div className="stat-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Members</span>
              <div className="stat-icon-wrapper">
                <FaUsers />
              </div>
            </div>
            <div className="stat-value">{totalMembers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeMembers} Active Accounts</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Rewards</span>
              <div className="stat-icon-wrapper">
                <FaGift />
              </div>
            </div>
            <div className="stat-value">{totalRewards}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Catalog Items</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Balance</span>
              <div className="stat-icon-wrapper">
                <FaCoins />
              </div>
            </div>
            <div className="stat-value">{totalPointsBalance.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>In Circulation</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Active Members</span>
              <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <FaUserCheck />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#16a34a' }}>{activeMembers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Eligible Accounts</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Earned</span>
              <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <FaArrowUp />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#16a34a' }}>+{totalPointsEarned.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Issuance</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Deducted</span>
              <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <FaArrowDown />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#dc2626' }}>-{totalPointsDeducted.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Adjustments</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Points Redeemed</span>
              <div className="stat-icon-wrapper" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <FaGift />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#2563eb' }}>{totalPointsRedeemed.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Converted Rewards</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Audit Log Count</span>
              <div className="stat-icon-wrapper">
                <FaExchangeAlt />
              </div>
            </div>
            <div className="stat-value">{transactions.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ledger Entries</div>
          </div>
        </div>
      )}

      {/* Modern Recent Activity Timeline & Recent Members */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        {/* Activity Timeline Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaHistory style={{ color: 'var(--primary)' }} /> Recent Activity Stream
            </h3>
            <Link to="/ledger" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>
              View Audit Log &rarr;
            </Link>
          </div>

          <div className="activity-timeline-list">
            {loading ? (
              <TableRowSkeleton rows={4} cols={4} />
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((t) => {
                const isEarn = t.transactionType === 'EARN';
                const isRedeem = t.transactionType === 'REDEEM';
                const iconClass = isEarn ? 'earn' : isRedeem ? 'redeem' : 'deduct';
                const memberName = t.member?.fullName || `Member #${t.memberId || t.customerId || 'N/A'}`;

                return (
                  <div key={t.transactionId} className="activity-timeline-item">
                    <div className="activity-item-left">
                      <div className={`activity-item-icon ${iconClass}`}>
                        {isEarn ? <FaCoins /> : isRedeem ? <FaGift /> : <FaMinusCircle />}
                      </div>
                      <div className="activity-item-details">
                        <div className="activity-item-desc">
                          {t.description || `${t.transactionType} Transaction`}
                        </div>
                        <div className="activity-item-sub">
                          {memberName} &bull; By {t.performedByName || 'System'}
                        </div>
                      </div>
                    </div>

                    <div className="activity-item-right">
                      <div className={`activity-pts-val ${isEarn ? 'positive' : 'negative'}`}>
                        {isEarn ? '+' : '-'}{t.points} pts
                      </div>
                      <div className="activity-time-text">{formatActivityTime(t.transactionDate)}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState icon={<FaHistory />} title="No Recent Activity" subtitle="No point audit entries recorded." />
            )}
          </div>
        </div>

        {/* Recent Members Roster */}
        <div className="table-container" style={{ height: 'fit-content' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Recent Member Registrations</h3>
            <Link to="/members" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>View All &rarr;</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Points</th>
                <th>Tier</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={4} />
              ) : recentMembers.length > 0 ? (
                recentMembers.map((m) => (
                  <tr key={m.memberId}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{m.fullName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.email}</div>
                    </td>
                    <td style={{ fontWeight: 800 }}>{m.points} pts</td>
                    <td><span className={`badge badge-${m.tier?.toLowerCase()}`}>{m.tier}</span></td>
                    <td><span className="badge badge-role">{m.role}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <EmptyState icon={<FaUsers />} title="No Members" subtitle="No member accounts created yet." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
