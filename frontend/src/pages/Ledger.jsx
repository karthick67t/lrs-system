import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiDownloadBlob } from '../utils/api';
import {
  FaExchangeAlt,
  FaSearch,
  FaRedo,
  FaLock,
  FaFileCsv,
  FaFilePdf,
  FaCalendarAlt,
  FaFilter,
  FaCheckCircle,
  FaSpinner,
  FaHistory
} from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

export const Ledger = () => {
  const { role, user } = useAuth();
  const isCustomer = role === 'CUSTOMER';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isCustomer ? '/api/transactions/me' : '/api/transactions';
      const data = await apiFetch(endpoint);
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load transaction ledger audit log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [role]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.member?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.performedByName?.toLowerCase().includes(search.toLowerCase()) ||
      t.transactionId?.toString().includes(search) ||
      t.member?.memberId?.toString().includes(search);
    
    const matchesType = typeFilter === 'ALL' || t.transactionType === typeFilter;

    let matchesStartDate = true;
    if (startDate) {
      const txDate = new Date(t.transactionDate).setHours(0, 0, 0, 0);
      const selStart = new Date(startDate).setHours(0, 0, 0, 0);
      matchesStartDate = txDate >= selStart;
    }

    let matchesEndDate = true;
    if (endDate) {
      const txDate = new Date(t.transactionDate).setHours(0, 0, 0, 0);
      const selEnd = new Date(endDate).setHours(0, 0, 0, 0);
      matchesEndDate = txDate <= selEnd;
    }

    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  const handleExport = async (format) => {
    if (!isSuperAdmin) {
      setError('Access Denied: Only SUPER_ADMIN users are authorized to export transaction history.');
      return;
    }

    setExporting(true);
    setExportFormat(format);
    setSuccessMsg('');
    setError('');

    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('transactionType', typeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (search && search.trim()) {
        const s = search.trim();
        if (!isNaN(s)) {
          params.append('customerId', s);
        } else {
          params.append('customerName', s);
        }
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const endpoint = `/api/transactions/export/${format}${queryString}`;
      
      const defaultFileName = `loyalty_transaction_history_${new Date().toISOString().split('T')[0]}.${format}`;
      const result = await apiDownloadBlob(endpoint, defaultFileName);
      setSuccessMsg(`Transaction audit history exported successfully (${result.fileName}).`);
    } catch (err) {
      setError(err.message || `Failed to export transaction history as ${format.toUpperCase()}.`);
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaExchangeAlt style={{ color: 'var(--primary)' }} />
            {isCustomer ? 'My Points Audit History' : 'Points Audit Ledger'}
          </h1>
          <p className="page-subtitle">
            {isCustomer
              ? 'Immutable audit history of all point earnings and reward redemptions on your account.'
              : 'Immutable audit record of all EARN, DEDUCT, and REDEEM point movements with performer tracking.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={loadTransactions} className="btn btn-secondary">
            <FaRedo className={loading ? 'spin' : ''} /> Refresh Audit Log
          </button>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
      {successMsg && (
        <div className="card" style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCheckCircle style={{ color: '#16a34a', fontSize: '18px' }} />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Export & Filter Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)' }}>
            <FaFilter style={{ color: 'var(--primary)' }} /> Filter Ledger Records ({filteredTransactions.length})
          </div>

          {/* Export Action Buttons (SUPER_ADMIN) */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isSuperAdmin ? (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="btn btn-secondary btn-sm"
                  title="Export filtered transactions as CSV"
                >
                  {exporting && exportFormat === 'csv' ? <FaSpinner className="spin" /> : <FaFileCsv style={{ color: '#16a34a', fontSize: '15px' }} />}
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="btn btn-secondary btn-sm"
                  title="Export filtered transactions as PDF"
                >
                  {exporting && exportFormat === 'pdf' ? <FaSpinner className="spin" /> : <FaFilePdf style={{ color: '#dc2626', fontSize: '15px' }} />}
                  Export PDF
                </button>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <FaLock /> CSV/PDF Export Restricted to SUPER_ADMIN
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder={isCustomer ? "Search by description..." : "Search by member name, description, ID, performer..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '160px' }}>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="EARN">EARN (+)</option>
              <option value="REDEEM">REDEEM (-)</option>
              <option value="DEDUCT">DEDUCT (-)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '150px' }}>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                title="Start Date Filter"
              />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>to</span>
            <div style={{ position: 'relative', width: '150px' }}>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                title="End Date Filter"
              />
            </div>
            {(startDate || endDate || search || typeFilter !== 'ALL') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tx ID</th>
              <th>Date & Time</th>
              {!isCustomer && <th>Member Account</th>}
              <th>Type</th>
              <th>Purchase Bill</th>
              <th>Points</th>
              <th>Previous Balance</th>
              <th>New Balance</th>
              <th>Description</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton rows={6} cols={isCustomer ? 9 : 10} />
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <tr key={t.transactionId}>
                  <td>#{t.transactionId}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(t.transactionDate)}</td>
                  {!isCustomer && (
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.member?.fullName || 'Member #' + t.member?.memberId}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.member?.email}</div>
                    </td>
                  )}
                  <td>
                    <span className={`badge ${t.transactionType === 'EARN' ? 'badge-active' : t.transactionType === 'REDEEM' ? 'badge-platinum' : 'badge-inactive'}`}>
                      <span className="badge-dot"></span>{t.transactionType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {t.billAmount ? `₹${parseFloat(t.billAmount).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ fontWeight: 800, color: t.transactionType === 'EARN' ? '#16a34a' : '#dc2626' }}>
                    {t.transactionType === 'EARN' ? '+' : '-'}{t.points} pts
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.previousBalance != null ? `${t.previousBalance} pts` : '-'}</td>
                  <td style={{ fontWeight: 700 }}>{t.newBalance != null ? `${t.newBalance} pts` : '-'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.description}</td>
                  <td>
                    <span className="badge badge-silver">
                      {t.performedByName || 'System'} ({t.performedByRole || 'SYSTEM'})
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isCustomer ? 9 : 10}>
                  <EmptyState
                    icon={<FaHistory />}
                    title="No Audit Entries"
                    subtitle="No transaction audit logs match your search and filter criteria."
                    actionLabel={search || typeFilter !== 'ALL' || startDate || endDate ? "Reset Filters" : null}
                    onAction={() => {
                      setSearch('');
                      setTypeFilter('ALL');
                      setStartDate('');
                      setEndDate('');
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
