import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password | Prof. Peter Mageto Portfolio';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) { setStatus('Please enter your email address.'); return; }
    setLoading(true);
    setStatus('');
    try {
      // For now, this is a UI-only flow. In production, wire to /api/auth/forgot-password
      await new Promise((r) => setTimeout(r, 1200));
      setSent(true);
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--centered">
      <div className="auth-form-wrap auth-form-wrap--solo">
        <div className="auth-brand-mark auth-brand-mark--center">
          <span className="auth-logo-circle">PM</span>
        </div>
        <h1 className="auth-title">Forgot password?</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="auth-success-card">
            <span className="auth-success-icon">✓</span>
            <strong>Check your inbox!</strong>
            <p>If an account exists for <em>{email}</em>, a reset link has been sent.</p>
            <Link to="/sign-in" className="auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Back to Sign In →
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="forgot-email">Email address</label>
              <p className="auth-field-helper">We'll send a password reset link to this address.</p>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {status && <p className="auth-status auth-status--error">{status}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>

            <p className="auth-switch">
              Remember it? <Link to="/sign-in">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}


