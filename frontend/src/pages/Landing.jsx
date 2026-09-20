import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaAward,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
  FaUsers,
  FaCoins,
  FaGift,
  FaTrophy,
  FaHandshake,
  FaBell,
  FaDollarSign,
  FaLock,
  FaUserShield,
  FaCheckCircle,
  FaLayerGroup,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCommentAlt,
  FaExclamationCircle,
  FaSpinner,
  FaClock,
  FaSlidersH
} from 'react-icons/fa';

export const Landing = () => {
  // Complaint Form State
  const [complaintForm, setComplaintForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const features = [
    { title: 'Customer Management', description: 'Create, update, search, filter, activate, and manage customer accounts with real-time status tracking.', icon: FaUsers },
    { title: 'Points Management', description: 'Earn and deduct points seamlessly with automatic audit transaction logging.', icon: FaCoins },
    { title: 'Rewards & Redemption', description: 'Manage reward catalog items, inventory stock, and enable instant point redemptions.', icon: FaGift },
    { title: 'Tier Management', description: 'Classify customers into Bronze, Silver, Gold, and Platinum tiers based on automated point thresholds.', icon: FaAward },
    { title: 'Challenges', description: 'Create engaging loyalty challenges, set bonus targets, and track participant progress in real time.', icon: FaTrophy },
    { title: 'Partner Management', description: 'Manage merchant partners and partner categories for cross-brand ecosystem redemptions.', icon: FaHandshake },
    { title: 'Transaction Tracking', description: 'Immutable transaction ledger tracking all EARN, DEDUCT, and REDEEM activities with performer audit trail.', icon: FaCoins },
    { title: 'Points Expiry', description: 'Track upcoming point expirations, automated 30-day warnings, and point lot lifecycles.', icon: FaClock },
    { title: 'Analytics', description: 'Provide actionable program insights, points velocity rates, tier distribution, and ROI performance statistics.', icon: FaChartLine },
    { title: 'Fraud Detection', description: 'Identify suspicious point activity velocity using automated risk scores and anomaly detection.', icon: FaShieldAlt },
    { title: 'Customer Feedback', description: 'Collect, review, and analyze customer ratings and sentiment feedback with point reward incentives.', icon: FaCommentAlt },
    { title: 'Notifications', description: 'Schedule and dispatch targeted notification broadcasts, system alerts, and complaint monitoring.', icon: FaBell },
  ];

  const howItWorksSteps = [
    { step: '01', title: 'Customer Joins Program', desc: 'Customer registers or gets onboarded into the loyalty program with an initial Bronze tier.' },
    { step: '02', title: 'Earns Points on Purchases', desc: 'Customer earns 1 loyalty point for every ₹10 spent on valid bill purchases at store locations.' },
    { step: '03', title: 'Reaches Higher Loyalty Tiers', desc: 'Point accumulation automatically promotes members to Silver, Gold, and Platinum status.' },
    { step: '04', title: 'Redeems Rewards', desc: 'Members exchange earned points for catalog rewards, discount vouchers, or partner perks.' },
  ];

  const roles = [
    { role: 'SUPER ADMIN', desc: 'Complete system administration, program configuration, fraud risk reviews, notification broadcasts, finance ledger, and member role assignments.', badge: 'Full System Access' },
    { role: 'LOYALTY MANAGER', desc: 'Manages loyalty operations, customers, rewards, analytics, tier thresholds, challenge campaigns, merchant partners, and customer feedback.', badge: 'Operations Management' },
    { role: 'STAFF', desc: 'Handles customer-facing store operations: search customers by ID/name/phone, issue/deduct points, view customer profiles, and process redemptions.', badge: 'Store Operations' },
    { role: 'CUSTOMER', desc: 'Views available point balances, tier progress, points expiry warnings, catalog rewards, transaction history, and submits feedback.', badge: 'Member Portal' },
  ];

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Frontend Validations
    if (!complaintForm.fullName || !complaintForm.fullName.trim()) {
      setSubmitError('Please enter your Full Name.');
      return;
    }

    if (!complaintForm.email || !complaintForm.email.trim()) {
      setSubmitError('Please enter your Email Address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(complaintForm.email.trim())) {
      setSubmitError('Please enter a valid Email Address.');
      return;
    }

    if (!complaintForm.subject || !complaintForm.subject.trim()) {
      setSubmitError('Please enter a Subject for your message.');
      return;
    }

    if (!complaintForm.message || !complaintForm.message.trim()) {
      setSubmitError('Please enter your Complaint / Message details.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fullName: complaintForm.fullName.trim(),
          email: complaintForm.email.trim(),
          phone: complaintForm.phone.trim(),
          subject: complaintForm.subject.trim(),
          message: complaintForm.message.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let msg = `Submission failed (${response.status}).`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.message) msg = parsed.message;
        } catch (err) {
          if (errorText) msg = errorText;
        }
        throw new Error(msg);
      }

      setSubmitSuccess('Your complaint has been submitted successfully. Our team will review it shortly.');
      setComplaintForm({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navigation */}
      <header style={{
        padding: '18px 48px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo"><FaAward /></div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>LRS</div>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Loyalty Rewards System</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '10px 22px' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '10px 22px' }}>Register</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" style={{
        padding: '80px 24px 60px',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          background: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          borderRadius: '30px',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: '13px',
          marginBottom: '24px',
          letterSpacing: '0.5px'
        }}>
          <FaLayerGroup /> ENTERPRISE LOYALTY PLATFORM
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 900,
          color: 'var(--text-main)',
          lineHeight: 1.15,
          marginBottom: '20px',
          letterSpacing: '-1px'
        }}>
          Reward customer loyalty. Build retention. <br />
          <span style={{ color: 'var(--primary)', background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Drive long-term growth.
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-muted)',
          maxWidth: '820px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          A centralized platform empowering businesses to manage customer loyalty, points issuance, reward redemptions, tier levels, challenges, analytics, and fraud protection in real time.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '10px' }}>
            Get Started Free <FaArrowRight />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '10px' }}>
            Portal Login
          </Link>
        </div>
      </section>

      {/* About The Platform Section */}
      <section style={{ padding: '60px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>ABOUT THE PLATFORM</span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '10px 0 16px' }}>Complete Customer Loyalty & Reward Management</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '840px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            The Loyalty Reward System (LRS) helps businesses manage customer loyalty, points accumulation, reward redemption catalogs, transaction audit ledgers, customer profiles, and engagement analytics from one central platform.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Unified Customer Hub</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Search and manage customer accounts, track points history, and view current loyalty tier standings.</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Real-time Points Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Automated point issuance (₹10 = 1 point), manual deductions, and transaction audit trails.</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Enterprise Security</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Stateless JWT authentication with strict backend Spring Security role authorization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>KEY FEATURES</span>
          <h2 style={{ fontSize: '36px', fontWeight: 900, marginTop: '8px' }}>Comprehensive Feature Suite</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px' }}>Explore the core capabilities built into the Loyalty Reward System.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  <Icon />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>HOW IT WORKS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 900, marginTop: '8px' }}>Simple 4-Step Loyalty Journey</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {howItWorksSteps.map((s, idx) => (
              <div key={idx} className="card" style={{ position: 'relative', borderTop: '4px solid var(--primary)' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)', opacity: 0.25, position: 'absolute', top: '16px', right: '20px' }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Overview Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>ROLE OVERVIEW</span>
          <h2 style={{ fontSize: '36px', fontWeight: 900, marginTop: '8px' }}>Role-Based Access System</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {roles.map((r, idx) => (
            <div key={idx} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900 }}>{r.role}</h3>
                <span className="badge badge-role">{r.badge}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action (CTA) Section */}
      <section style={{ padding: '70px 24px', background: 'var(--primary-light)', borderTop: '1px solid var(--primary-border)', borderBottom: '1px solid var(--primary-border)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>
            Ready to start managing customer loyalty?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Access your loyalty portal or register a new customer account to get started.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Public Complaint / Contact Us Form Section */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>CONTACT US</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>Have a complaint or need help?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              Submit your inquiry or complaint directly to our management support team.
            </p>
          </div>

          <div className="card" style={{ padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            {submitError && <div className="alert-error" style={{ marginBottom: '20px' }}>{submitError}</div>}
            {submitSuccess && <div className="alert-success" style={{ marginBottom: '20px' }}>{submitSuccess}</div>}

            <form onSubmit={handleComplaintSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={complaintForm.fullName}
                    onChange={(e) => setComplaintForm({ ...complaintForm, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={complaintForm.email}
                    onChange={(e) => setComplaintForm({ ...complaintForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    value={complaintForm.phone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief subject of inquiry"
                    value={complaintForm.subject}
                    onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Complaint / Message *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Describe your issue or feedback in detail..."
                  value={complaintForm.message}
                  onChange={(e) => setComplaintForm({ ...complaintForm, message: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 800 }}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="spin" /> Submitting Complaint...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '56px 24px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'white' }}>
              <div className="brand-logo" style={{ width: '36px', height: '36px', fontSize: '18px' }}><FaAward /></div>
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>Loyalty Rewards</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94a3b8' }}>
              Smart customer loyalty and reward management platform for enterprise businesses.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>
                <a href="#hero" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Home</a>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Login</Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Register</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaEnvelope style={{ color: 'var(--primary)' }} />
                <span>support@loyaltyrewards.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaPhoneAlt style={{ color: 'var(--primary)' }} />
                <span>+91 XXXXX XXXXX</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
                <span>Coimbatore, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          &copy; {new Date().getFullYear()} Loyalty Rewards System &bull; All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
