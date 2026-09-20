import React, { useState } from 'react';
import { FaSlidersH, FaSave, FaCheckCircle } from 'react-icons/fa';

export const ProgramConfig = () => {
  const [config, setConfig] = useState({
    programName: 'MedPulse Enterprise Loyalty Program',
    pointsPerDollar: 10,
    pointExpiryDays: 365,
    silverThreshold: 1000,
    goldThreshold: 2500,
    platinumThreshold: 5000,
    autoFraudFlagging: true,
    maxDailyIssuanceLimit: 50000,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Program Configuration</h1>
          <p className="page-subtitle">Super Admin System Rules & Global Loyalty Parameters.</p>
        </div>
      </div>

      {saved && (
        <div className="alert-success">
          <FaCheckCircle /> Loyalty program configuration saved successfully.
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Global Loyalty System Parameters</h3>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Program Name</label>
            <input
              type="text"
              className="form-input"
              value={config.programName}
              onChange={(e) => setConfig({ ...config, programName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Earning Rate (Points per $1 Spent)</label>
              <input
                type="number"
                className="form-input"
                value={config.pointsPerDollar}
                onChange={(e) => setConfig({ ...config, pointsPerDollar: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Point Expiry Window (Days)</label>
              <input
                type="number"
                className="form-input"
                value={config.pointExpiryDays}
                onChange={(e) => setConfig({ ...config, pointExpiryDays: parseInt(e.target.value) || 365 })}
              />
            </div>
          </div>

          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '24px 0 12px', color: 'var(--primary)' }}>
            Tier Point Threshold Definitions
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Silver Tier Min Pts</label>
              <input
                type="number"
                className="form-input"
                value={config.silverThreshold}
                onChange={(e) => setConfig({ ...config, silverThreshold: parseInt(e.target.value) || 1000 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gold Tier Min Pts</label>
              <input
                type="number"
                className="form-input"
                value={config.goldThreshold}
                onChange={(e) => setConfig({ ...config, goldThreshold: parseInt(e.target.value) || 2500 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Platinum Tier Min Pts</label>
              <input
                type="number"
                className="form-input"
                value={config.platinumThreshold}
                onChange={(e) => setConfig({ ...config, platinumThreshold: parseInt(e.target.value) || 5000 })}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              <FaSave /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
