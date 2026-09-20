import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaAward, FaLock, FaEnvelope, FaUserShield } from 'react-icons/fa';

export const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and assigned role.');
      setLoading(false);
    }
  };

  const handleDemoFill = (demoRole) => {
    if (demoRole === 'SUPER_ADMIN') {
      setEmail('admin@loyalty.com');
      setPassword('admin123');
      setRole('SUPER_ADMIN');
    } else if (demoRole === 'LOYALTY_MANAGER') {
      setEmail('manager@loyalty.com');
      setPassword('manager123');
      setRole('LOYALTY_MANAGER');
    } else if (demoRole === 'STAFF') {
      setEmail('staff@loyalty.com');
      setPassword('staff123');
      setRole('STAFF');
    } else if (demoRole === 'CUSTOMER') {
      setEmail('customer@loyalty.com');
      setPassword('customer123');
      setRole('CUSTOMER');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-logo" style={{ margin: '0 auto 16px', width: '48px', height: '48px', fontSize: '26px' }}>
            <FaAward />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Sign In to LRS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Loyalty Rewards System Portal
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email / Phone / Customer ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com or phone / ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Login Role</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                style={{ paddingLeft: '38px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="CUSTOMER">CUSTOMER (Customer Portal)</option>
                <option value="STAFF">STAFF (Store Operations)</option>
                <option value="LOYALTY_MANAGER">LOYALTY_MANAGER (Manager Portal)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full System Access)</option>
              </select>
              <FaUserShield style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              * Must exactly match the role assigned to your account in PostgreSQL.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
            DEMO ONE-CLICK FILL:
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => handleDemoFill('CUSTOMER')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
              Customer
            </button>
            <button onClick={() => handleDemoFill('STAFF')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
              Staff
            </button>
            <button onClick={() => handleDemoFill('LOYALTY_MANAGER')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
              Manager
            </button>
            <button onClick={() => handleDemoFill('SUPER_ADMIN')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
              Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register Customer Account</Link>
        </div>
      </div>
    </div>
  );
};
