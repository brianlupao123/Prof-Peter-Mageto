import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa6';

export default function SignIn({ signedIn, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In | Prof. Peter Mageto Portfolio';
  }, []);

  if (signedIn) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setStatus('Please fill in all fields.'); return; }
    setLoading(true);
    setStatus('');
    try {
      await onSignIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setStatus(err.message || 'Invalid credentials. Please try again.');
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
          <blockquote>"Leadership anchored in people and values."</blockquote>
          <p>Sign in to access the admin dashboard, review messages, and manage content.</p>
        </div>
        <div className="auth-panel-decor" aria-hidden="true">
          <span>AU</span>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue.</p>

          {/* Google button */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={() => setStatus('Google Auth coming soon — contact admin for access.')}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or sign in with email</span></div>

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="signin-email">Email address</label>
              <p className="auth-field-helper">Use the email registered to your account.</p>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signin-password">Password</label>
              <p className="auth-field-helper">At least 6 characters. Case-sensitive.</p>
              <div className="auth-input-wrap">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="auth-field-row">
                <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
              </div>
            </div>

            {status && (
              <p className={`auth-status ${status.toLowerCase().includes('soon') ? 'auth-status--info' : 'auth-status--error'}`}>
                {status}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="auth-switch">
            No account? <Link to="/sign-up">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
