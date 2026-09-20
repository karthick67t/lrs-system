import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaAward,
  FaChartLine,
  FaCoins,
  FaExchangeAlt,
  FaGift,
  FaHandshake,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
  FaBell,
  FaDollarSign,
  FaSlidersH,
  FaTachometerAlt,
  FaUserAlt,
  FaUserPlus,
  FaCommentAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { role } = useAuth();
  const normalizedRole = role ? (String(role).toUpperCase().trim().startsWith('ROLE_') ? String(role).toUpperCase().trim().substring(5) : String(role).toUpperCase().trim()) : null;

  let allowedNavItems = [];

  if (normalizedRole === 'CUSTOMER') {
    allowedNavItems = [
      { label: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
      { label: 'My Points', path: '/dashboard', icon: FaCoins },
      { label: 'My Transactions', path: '/ledger', icon: FaExchangeAlt },
      { label: 'Rewards', path: '/rewards', icon: FaGift },
      { label: 'My Profile', path: '/profile', icon: FaUserAlt },
    ];
  } else if (normalizedRole === 'STAFF') {
    allowedNavItems = [
      { label: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
      { label: 'Members', path: '/members', icon: FaUsers },
      { label: 'Add Customer', path: '/members?action=add-customer', icon: FaUserPlus },
      { label: 'Manage Customer Points', path: '/earn-points', icon: FaCoins },
      { label: 'Ledger', path: '/ledger', icon: FaExchangeAlt },
      { label: 'Rewards', path: '/rewards', icon: FaGift },
    ];
  } else if (normalizedRole === 'LOYALTY_MANAGER') {
    allowedNavItems = [
      { label: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
      { label: 'Members', path: '/members', icon: FaUsers },
      { label: 'Manage Customer Points', path: '/earn-points', icon: FaCoins },
      { label: 'Ledger', path: '/ledger', icon: FaExchangeAlt },
      { label: 'Tier Management', path: '/tier-management', icon: FaAward },
      { label: 'Rewards', path: '/rewards', icon: FaGift },
      { label: 'Challenges', path: '/challenges', icon: FaTrophy },
      { label: 'Partners', path: '/partners', icon: FaHandshake },
      { label: 'Customer Feedback', path: '/feedback', icon: FaCommentAlt },
      { label: 'Analytics', path: '/analytics', icon: FaChartLine },
    ];
  } else {
    // SUPER_ADMIN
    allowedNavItems = [
      { label: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
      { label: 'Members', path: '/members', icon: FaUsers },
      { label: 'Manage Customer Points', path: '/earn-points', icon: FaCoins },
      { label: 'Ledger', path: '/ledger', icon: FaExchangeAlt },
      { label: 'Tier Management', path: '/tier-management', icon: FaAward },
      { label: 'Rewards', path: '/rewards', icon: FaGift },
      { label: 'Challenges', path: '/challenges', icon: FaTrophy },
      { label: 'Partners', path: '/partners', icon: FaHandshake },
      { label: 'Customer Feedback', path: '/feedback', icon: FaCommentAlt },
      { label: 'Analytics', path: '/analytics', icon: FaChartLine },
      { label: 'Program Configuration', path: '/program-config', icon: FaSlidersH },
      { label: 'Fraud Detection', path: '/fraud-detection', icon: FaShieldAlt },
      { label: 'Notifications', path: '/notifications', icon: FaBell },
      { label: 'Customer Complaints', path: '/complaints', icon: FaCommentAlt },
      { label: 'Finance', path: '/finance', icon: FaDollarSign },
    ];
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <FaAward />
          </div>
          <div className="brand-info" style={{ flex: 1, overflow: 'hidden' }}>
            <h1 className="brand-title">LRS</h1>
            <div className="brand-subtitle">Loyalty Rewards System</div>
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="collapse-toggle-btn desktop-only-toggle"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Collapsible Sidebar"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={onClose}
              className="mobile-nav-toggle"
              style={{ display: 'block' }}
              aria-label="Close Mobile Sidebar"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {allowedNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={`${item.label}-${item.path}-${index}`}
                to={item.path}
                onClick={onClose}
                title={item.label}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
