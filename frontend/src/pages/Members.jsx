import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaRedo, FaCoins, FaLock, FaShieldAlt, FaInfoCircle, FaEye, FaUsers, FaTimes } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import { CustomerProfileModal } from '../components/CustomerProfileModal';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

export const Members = () => {
  const { role: currentUserRole } = useAuth();
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';
  const isStaff = currentUserRole === 'STAFF';
  const isManager = currentUserRole === 'LOYALTY_MANAGER';

  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileMember, setSelectedProfileMember] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    points: 0,
    status: 'ACTIVE',
    role: 'CUSTOMER',
  });

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/members');
      setMembers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load member roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add-customer') {
      handleOpenAdd();
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      points: 0,
      status: 'ACTIVE',
      role: 'CUSTOMER',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setFormData({
      fullName: m.fullName || '',
      email: m.email || '',
      phone: m.phone || '',
      password: '',
      confirmPassword: '',
      points: m.points || 0,
      status: m.status || 'ACTIVE',
      role: m.role || 'CUSTOMER',
    });
    setShowModal(true);
  };

  const handleOpenQuickProfile = (m) => {
    if (isStaff && m.role !== 'CUSTOMER') {
      alert('Access Restricted: STAFF users are authorized to view CUSTOMER profiles only.');
      return;
    }
    setSelectedProfileMember(m);
    setShowProfileModal(true);
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      alert('Only SUPER_ADMIN can delete member accounts.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this member account?')) return;
    try {
      await apiFetch(`/api/members/${id}`, { method: 'DELETE' });
      setSuccess('Member deleted successfully.');
      loadMembers();
    } catch (err) {
      setError(err.message || 'Failed to delete member.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingMember && !isStaff && formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    try {
      if (editingMember) {
        const updatePayload = {
          fullName: formData.fullName,
          phone: formData.phone,
          status: formData.status,
        };
        if (formData.password && formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }

        await apiFetch(`/api/members/${editingMember.memberId}`, {
          method: 'PUT',
          body: JSON.stringify(updatePayload),
        });

        if (isSuperAdmin && formData.role !== editingMember.role) {
          await apiFetch(`/api/members/${editingMember.memberId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: formData.role }),
          });
        }

        setSuccess('Member updated successfully.');
      } else {
        const createPayload = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          status: 'ACTIVE',
          role: isStaff ? 'CUSTOMER' : formData.role,
        };

        if (isStaff) {
          createPayload.password = formData.phone;
          createPayload.defaultPassword = true;
        } else {
          createPayload.password = formData.password;
        }

        await apiFetch('/api/members', {
          method: 'POST',
          body: JSON.stringify(createPayload),
        });

        setSuccess(isStaff ? 'New customer account created successfully. Default password is their phone number.' : 'Member created successfully.');
      }

      setShowModal(false);
      loadMembers();
    } catch (err) {
      setError(err.message || 'Failed to save member details.');
    }
  };

  const filteredMembers = members.filter((m) => {
    if (isStaff && m.role !== 'CUSTOMER') return false;
    if (isManager && m.role === 'SUPER_ADMIN') return false;

    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      String(m.memberId).includes(q) ||
      m.fullName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesTier = tierFilter === 'ALL' || m.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const renderTierBadge = (tier) => {
    const cls = `badge badge-${tier?.toLowerCase() || 'bronze'}`;
    return <span className={cls}>{tier || 'BRONZE'}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaUsers style={{ color: 'var(--primary)' }} />
            {isStaff ? 'Customer Management' : 'Member Management'}
          </h1>
          <p className="page-subtitle">
            {isStaff
              ? 'Search customers by ID, name or phone number, view details, and manage points.'
              : 'View, search, create, and manage enterprise loyalty members.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadMembers} className="btn btn-secondary">
            <FaRedo className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <FaUserPlus /> {isStaff ? 'Add New Customer' : 'Add New Member'}
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder={isStaff ? "Search customers by ID, name or phone..." : "Search member by ID, name, email or phone..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '160px' }}>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div style={{ width: '160px' }}>
            <select className="form-select" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
              <option value="ALL">All Tiers</option>
              <option value="BRONZE">BRONZE (&lt;1000)</option>
              <option value="SILVER">SILVER (&ge;1000)</option>
              <option value="GOLD">GOLD (&ge;2500)</option>
              <option value="PLATINUM">PLATINUM (&ge;5000)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member Name & Email</th>
              <th>Phone</th>
              <th>Points</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton rows={6} cols={8} />
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((m) => (
                <tr key={m.memberId}>
                  <td>#{m.memberId}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{m.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.phone || 'N/A'}</td>
                  <td style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>
                    {m.points} pts
                  </td>
                  <td>{renderTierBadge(m.tier)}</td>
                  <td>
                    <span className={`badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                      <span className="badge-dot"></span>{m.status}
                    </span>
                  </td>
                  <td><span className="badge badge-role">{m.role}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(!isStaff || m.role === 'CUSTOMER') && (m.role !== 'SUPER_ADMIN' || isSuperAdmin) && (
                        <button
                          onClick={() => handleOpenQuickProfile(m)}
                          className="btn btn-secondary btn-sm"
                          title="Quick Profile View"
                        >
                          <FaEye /> View
                        </button>
                      )}
                      {m.role === 'CUSTOMER' && (
                        <Link to="/earn-points" className="btn btn-secondary btn-sm" title="Earn/Deduct Points">
                          <FaCoins />
                        </Link>
                      )}
                      {(isSuperAdmin || (isManager && m.role !== 'SUPER_ADMIN') || (isStaff && m.role === 'CUSTOMER')) && (
                        <button onClick={() => handleOpenEdit(m)} className="btn btn-secondary btn-sm" title="Edit Member">
                          <FaEdit />
                        </button>
                      )}
                      {(isSuperAdmin || (isManager && m.role !== 'SUPER_ADMIN')) && (
                        <button onClick={() => handleDelete(m.memberId)} className="btn btn-danger btn-sm" title="Delete Member">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <EmptyState
                    icon={<FaUsers />}
                    title="No Members Found"
                    subtitle="No member records match your search criteria."
                    actionLabel={search || statusFilter !== 'ALL' || tierFilter !== 'ALL' ? "Reset Filters" : "Add Member"}
                    onAction={() => {
                      if (search || statusFilter !== 'ALL' || tierFilter !== 'ALL') {
                        setSearch('');
                        setStatusFilter('ALL');
                        setTierFilter('ALL');
                      } else {
                        handleOpenAdd();
                      }
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMember ? 'Edit Member Details' : (isStaff ? 'Add New Customer' : 'Create New Member')}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. customer@example.com"
                  required
                  disabled={!!editingMember}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  required={!editingMember && isStaff}
                />
              </div>

              {!editingMember ? (
                isStaff ? (
                  <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '10px', color: '#1e40af', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaInfoCircle style={{ fontSize: '16px', flexShrink: 0 }} />
                    <span>Customer's phone number will be used as their initial login password.</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reset Password (Optional)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Leave blank to keep unchanged"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {!isStaff && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>System Role</span>
                    {editingMember && !isSuperAdmin && (
                      <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FaLock /> Role lock (SUPER_ADMIN only)
                      </span>
                    )}
                  </label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={editingMember ? !isSuperAdmin : false}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="STAFF">STAFF</option>
                    {isSuperAdmin && <option value="LOYALTY_MANAGER">LOYALTY_MANAGER</option>}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? 'Save Changes' : (isStaff ? 'Create Customer Account' : 'Create Member Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        member={selectedProfileMember}
      />
    </div>
  );
};
