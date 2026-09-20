import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { FaUserAlt, FaAward, FaCoins, FaLock, FaSave, FaCheckCircle, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { LoyaltyJourney } from '../components/LoyaltyJourney';

export const Profile = () => {
  const { user, memberId, role, setUser, refreshUser } = useAuth();
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      try {
        data = await apiFetch('/api/members/me');
      } catch (e) {
        if (memberId) {
          data = await apiFetch(`/api/members/${memberId}`);
        }
      }

      const txData = await apiFetch('/api/transactions/me').catch(() => []);

      if (data) {
        setMember(data);
        setProfileForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
        });
      }
      setTransactions(txData || []);
    } catch (err) {
      setError(err.message || 'Failed to load user profile information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSavingProfile(true);

    try {
      const updatePayload = {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      };

      const updated = await apiFetch(`/api/members/${member?.memberId || memberId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      setMember(updated);
      setUser(updated);
      localStorage.setItem('member', JSON.stringify(updated));
      setSuccess('Profile details updated successfully!');
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passForm.newPassword || passForm.newPassword.trim() === '') {
      setError('New password cannot be empty.');
      return;
    }

    if (passForm.newPassword !== passForm.confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setChangingPass(true);
    try {
      await apiFetch('/api/members/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
          confirmNewPassword: passForm.confirmNewPassword,
        }),
      });

      setSuccess('Password changed successfully! Please use your new password for future logins.');
      setPassForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      loadProfileData();
    } catch (err) {
      setError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setChangingPass(false);
    }
  };

  const getRoleLabel = (r) => {
    switch (r) {
      case 'SUPER_ADMIN': return 'SUPER ADMIN';
      case 'LOYALTY_MANAGER': return 'LOYALTY MANAGER';
      case 'STAFF': return 'STAFF';
      default: return r || 'USER';
    }
  };

  const renderTierBadge = (tier) => {
    const cls = `badge badge-${tier?.toLowerCase() || 'bronze'}`;
    return <span className={cls} style={{ fontSize: '13px', padding: '5px 12px' }}><FaAward /> {tier || 'BRONZE'} TIER</span>;
  };

  const isDefaultPassword = member?.phone && (member?.password === member?.phone || member?.defaultPassword);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account Profile</h1>
          <p className="page-subtitle">Manage personal account details, security settings, and view loyalty milestone achievements.</p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {isDefaultPassword && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fffbebfd', border: '1px solid #fde68a', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <FaExclamationTriangle style={{ fontSize: '24px', color: '#d97706', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '15px' }}>Security Notice: Default Phone Password Detected</div>
            <div style={{ fontSize: '13px', color: '#b45309', marginTop: '2px' }}>
              You are currently using your phone number as your initial password. Please change your password below for account security.
            </div>
          </div>
        </div>
      )}

      {/* Customer Summary Card */}
      <div className="card" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '28px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: 800,
          boxShadow: 'var(--accent-glow)',
          flexShrink: 0
        }}>
          {member?.fullName ? member.fullName[0].toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{member?.fullName || 'User Profile'}</h2>
            <span className="badge badge-role">{getRoleLabel(member?.role || role)}</span>
            {renderTierBadge(member?.tier)}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {member?.email} &bull; Member ID: <strong>#{member?.memberId || memberId || 'N/A'}</strong>
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>AVAILABLE POINTS</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)' }}>
            {(member?.points ?? user?.points ?? 0).toLocaleString()} pts
          </div>
        </div>
      </div>

      {/* Loyalty Journey & Achievements Section */}
      <LoyaltyJourney
        points={member?.points ?? user?.points ?? 0}
        transactions={transactions}
        tier={member?.tier}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Personal Details Form */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Personal Details</h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-Only)</label>
              <input
                type="email"
                className="form-input"
                value={member?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                <FaSave /> {savingProfile ? 'Saving Details...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Dedicated Change Password Form */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaLock /> Change Account Password
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your current password"
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={passForm.confirmNewPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmNewPassword: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#2563eb' }} disabled={changingPass}>
                <FaShieldAlt /> {changingPass ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
