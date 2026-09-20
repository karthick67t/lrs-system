import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { FaStar, FaTimes, FaGift, FaCommentAlt, FaCheck, FaCoins, FaHandshake, FaExchangeAlt, FaShieldAlt } from 'react-icons/fa';

export const FeedbackModal = ({ isOpen, onClose, onSuccess, initialType = 'GENERAL', targetRewardId, targetPartnerId, targetTxId, rewards = [], partners = [], transactions = [] }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState(initialType);

  const [rewardId, setRewardId] = useState(targetRewardId || '');
  const [partnerId, setPartnerId] = useState(targetPartnerId || '');
  const [transactionId, setTransactionId] = useState(targetTxId || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (feedbackType === 'REWARD' && !rewardId) {
      setError('Please select the reward you want to give feedback for.');
      return;
    }

    if (feedbackType === 'TRANSACTION' && !transactionId) {
      setError('Please select the transaction you want to give feedback for.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        rating,
        comment: comment.trim(),
        feedbackType,
        rewardId: rewardId ? parseInt(rewardId) : null,
        partnerId: partnerId ? parseInt(partnerId) : null,
        transactionId: transactionId ? parseInt(transactionId) : null,
      };

      const res = await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Thank you! Your feedback has been recorded (Sentiment: ${res.sentiment}). You earned +5 bonus points!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FaCommentAlt style={{ color: 'var(--primary)' }} /> Share Your Loyalty Feedback
          </h3>
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        {/* Bonus Point Incentive Banner */}
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontSize: '13px' }}>
          <FaCoins style={{ fontSize: '20px', color: '#16a34a', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800 }}>Earn +5 Bonus Loyalty Points!</div>
            <div>Submit verified feedback for your experience to receive 5 instant reward points.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating Input */}
          <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '8px', fontWeight: 800 }}>Overall Rating (1 - 5 Stars)</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  style={{
                    fontSize: '32px',
                    cursor: 'pointer',
                    color: (hoverRating || rating) >= star ? '#f59e0b' : '#e2e8f0',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 700 }}>
              {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' : rating === 4 ? '⭐⭐⭐⭐ Very Good' : rating === 3 ? '⭐⭐⭐ Average' : rating === 2 ? '⭐⭐ Poor' : '⭐ Terrible'}
            </div>
          </div>

          {/* Feedback Type Selection */}
          <div className="form-group">
            <label className="form-label">Feedback Category</label>
            <select
              className="form-select"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
            >
              <option value="GENERAL">GENERAL (Overall Loyalty Experience)</option>
              <option value="REWARD">REWARD (Redeemed Reward Items)</option>
              <option value="TRANSACTION">TRANSACTION (Point Earn / Deduct Transaction)</option>
              <option value="PARTNER">PARTNER (Brand Partner Service)</option>
            </select>
          </div>

          {/* Context Selectors */}
          {feedbackType === 'REWARD' && (
            <div className="form-group">
              <label className="form-label">Select Reward Item</label>
              <select className="form-select" value={rewardId} onChange={(e) => setRewardId(e.target.value)} required>
                <option value="">-- Choose Reward --</option>
                {rewards.map((r) => (
                  <option key={r.rewardId} value={r.rewardId}>
                    {r.name} ({r.pointsRequired} pts)
                  </option>
                ))}
              </select>
            </div>
          )}

          {feedbackType === 'TRANSACTION' && (
            <div className="form-group">
              <label className="form-label">Select Transaction</label>
              <select className="form-select" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required>
                <option value="">-- Choose Transaction --</option>
                {transactions.map((t) => (
                  <option key={t.transactionId} value={t.transactionId}>
                    Tx #{t.transactionId} - {t.transactionType} ({t.points} pts) &bull; {t.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {feedbackType === 'PARTNER' && partners.length > 0 && (
            <div className="form-group">
              <label className="form-label">Select Brand Partner (Optional)</label>
              <select className="form-select" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                <option value="">-- Choose Partner --</option>
                {partners.map((p) => (
                  <option key={p.partnerId} value={p.partnerId}>
                    {p.name || p.partnerName} ({p.category || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Comment Area */}
          <div className="form-group">
            <label className="form-label">Your Experience Comments</label>
            <textarea
              className="form-input"
              style={{ minHeight: '90px', resize: 'vertical' }}
              placeholder="Tell us what you liked or how we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <FaCheck /> {submitting ? 'Submitting...' : 'Submit Feedback & Claim +5 Pts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
