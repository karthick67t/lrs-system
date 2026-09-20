import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import {
  FaSignOutAlt,
  FaUserAlt,
  FaChevronDown,
  FaBars,
  FaBell,
  FaCommentAlt,
  FaCoins,
  FaGift,
  FaCheckDouble,
  FaArrowRight
} from 'react-icons/fa';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Read notifications tracking stored in localStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('lrs_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const normalizedRole = role ? (String(role).toUpperCase().trim().startsWith('ROLE_') ? String(role).toUpperCase().trim().substring(5) : String(role).toUpperCase().trim()) : null;

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data || []);
    } catch (err) {
      // Silently catch network/fetch errors in header
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [role]);

  // Outside click listener for both dropdowns
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getRoleLabel = (r) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return 'SUPER ADMIN';
      case 'LOYALTY_MANAGER':
        return 'LOYALTY MANAGER';
      case 'STAFF':
        return 'STAFF';
      case 'CUSTOMER':
        return 'CUSTOMER';
      default:
        return r || 'USER';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter notifications by role security
  const authorizedNotifications = notifications.filter((n) => {
    if (normalizedRole === 'SUPER_ADMIN') return true;
    if (n.type === 'ANNOUNCEMENT') {
      if (normalizedRole === 'CUSTOMER') return false; // CUSTOMER does NOT receive admin announcements
      if (user?.email && n.audience === user.email) return true;
      if (user?.memberId && n.recipientId === user.memberId) return true;
      if (normalizedRole && n.recipientRole === normalizedRole) return true;
      return true;
    }
    if (!n.audience || n.audience === 'ALL') return true;
    if (normalizedRole && n.audience.toUpperCase() === normalizedRole) return true;
    if (user?.email && n.audience === user.email) return true;
    return false;
  });

  // Calculate unread count
  const unreadCount = authorizedNotifications.filter((n) => !readIds.includes(n.notificationId)).length;

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('lrs_read_notifications', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const markAllAsRead = () => {
    const allIds = authorizedNotifications.map((n) => n.notificationId);
    const merged = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(merged);
    try {
      localStorage.setItem('lrs_read_notifications', JSON.stringify(merged));
    } catch (e) {}
  };

  const handleNotificationClick = (n) => {
    markAsRead(n.notificationId);
    setNotifDropdownOpen(false);

    const isComplaint = n.title?.toLowerCase().includes('complaint') || n.message?.toLowerCase().includes('complaint');
    if (isComplaint && normalizedRole === 'SUPER_ADMIN') {
      navigate('/complaints');
    } else {
      navigate('/notifications');
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const renderNotifIcon = (n) => {
    const text = `${n.title || ''} ${n.message || ''} ${n.type || ''}`.toLowerCase();
    if (n.type === 'ANNOUNCEMENT' || text.includes('announcement')) {
      return (
        <div className="notif-item-icon" style={{ background: '#fef3c7', color: '#d97706', fontSize: '15px' }}>
          📢
        </div>
      );
    }
    if (text.includes('complaint')) {
      return (
        <div className="notif-item-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
          <FaCommentAlt />
        </div>
      );
    }
    if (text.includes('point') || text.includes('earn') || text.includes('coins')) {
      return (
        <div className="notif-item-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
          <FaCoins />
        </div>
      );
    }
    if (text.includes('reward') || text.includes('redeem')) {
      return (
        <div className="notif-item-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
          <FaGift />
        </div>
      );
    }
    return (
      <div className="notif-item-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
        <FaBell />
      </div>
    );
  };

  const latestNotifications = authorizedNotifications.slice(0, 5);

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-nav-toggle"
          aria-label="Toggle Navigation Sidebar"
        >
          <FaBars />
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
          LRS &bull; LOYALTY REWARDS SYSTEM &bull; PORTAL
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Notification Bell Dropdown Button */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button
            className="notif-bell-btn"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setDropdownOpen(false);
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notif-badge-pill">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notifDropdownOpen && (
            <div className="notif-dropdown-panel">
              <div className="notif-dropdown-header">
                <div className="notif-dropdown-title">
                  <FaBell style={{ color: 'var(--primary)' }} /> Notifications
                  {unreadCount > 0 && (
                    <span className="badge badge-active" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaCheckDouble /> Mark All Read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {latestNotifications.length > 0 ? (
                  latestNotifications.map((n) => {
                    const isUnread = !readIds.includes(n.notificationId);
                    return (
                      <div
                        key={n.notificationId}
                        className={`notif-dropdown-item ${isUnread ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        {renderNotifIcon(n)}
                        <div className="notif-item-content">
                          <div className="notif-item-title">
                            <span>{n.title}</span>
                            {isUnread && <span className="badge-dot" style={{ background: '#dc2626' }}></span>}
                          </div>
                          <div className="notif-item-msg">{n.message}</div>
                          <div className="notif-item-time">{getTimeAgo(n.createdAt || n.scheduledDate)}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No notifications available.
                  </div>
                )}
              </div>

              <div className="notif-dropdown-footer">
                <Link
                  to={normalizedRole === 'SUPER_ADMIN' ? '/notifications' : '/dashboard'}
                  onClick={() => setNotifDropdownOpen(false)}
                >
                  View All Notifications <FaArrowRight style={{ fontSize: '11px' }} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="navbar-user" style={{ position: 'relative' }} ref={userMenuRef}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              {user?.fullName || 'Authenticated User'}
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
              <span className="badge badge-role">{getRoleLabel(role)}</span>
            </div>
          </div>

          <div
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifDropdownOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background 0.2s ease',
            }}
            className="user-menu-trigger"
          >
            <div className="user-avatar">
              {getInitials(user?.fullName)}
            </div>
            <FaChevronDown style={{ fontSize: '12px', color: 'var(--text-muted)' }} />
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '55px',
                right: 0,
                width: '240px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--primary-light)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>{user?.fullName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
                <div style={{ marginTop: '6px' }}>
                  <span className="badge badge-role" style={{ fontSize: '10px' }}>{getRoleLabel(role)}</span>
                </div>
              </div>

              <div style={{ padding: '8px' }}>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '10px 14px', fontSize: '13px' }}
                >
                  <FaUserAlt /> My Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '10px 14px', fontSize: '13px', color: '#dc2626' }}
                >
                  <FaSignOutAlt /> Logout to LRS Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
