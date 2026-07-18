import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

export default function SignUp({ signedIn, onSignIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account | Prof. Peter Mageto Portfolio';
  }, []);

  if (signedIn) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setStatus('Please fill in all fields.'); return; }
    if (password.length < 6) { setStatus('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setStatus('Passwords do not match.'); return; }
    setLoading(true);
    setStatus('');
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      // Auto-sign in after successful registration
      await onSignIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setStatus(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand-mark">
          <span className="auth-logo-circle">PM</span>
          <div>
            <strong>Prof. Peter Mageto</strong>
            <small>Africa University Vice Chancellor</small>
          </div>
        </div>
        <div className="auth-panel-quote">
          <blockquote>"Education is the foundation of transformation."</blockquote>
          <p>Create your account to engage with content, leave comments, and follow the Vice Chancellor's journey.</p>
        </div>
        <div className="auth-panel-decor" aria-hidden="true">
          <span>AU</span>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join to engage with leadership content and updates.</p>

          {/* Google button */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={() => setStatus('Google Auth coming soon. Please use the form below.')}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or sign up with email</span></div>

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <p className="auth-field-helper">Your display name visible to other users.</p>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <p className="auth-field-helper">We'll use this to identify your account.</p>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <p className="auth-field-helper">At least 6 characters. Choose something strong.</p>
              <div className="auth-input-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="auth-toggle-pw" aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm password</label>
              <p className="auth-field-helper">Re-enter your password to confirm.</p>
              <div className="auth-input-wrap">
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="auth-toggle-pw" aria-label="Toggle confirm password" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {status && (
              <p className={`auth-status ${status.toLowerCase().includes('soon') ? 'auth-status--info' : 'auth-status--error'}`}>
                {status}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
