import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaShieldHalved } from 'react-icons/fa6';

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

  const submit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setStatus('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      await onSignIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setStatus(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand-mark">
          <span className="auth-logo-circle">PM</span>
          <div>
            <strong>Prof. Peter Mageto</strong>
            <small>Africa University Vice Chancellor</small>
          </div>
        </div>
        <div className="auth-panel-quote">
          <FaShieldHalved aria-hidden="true" />
          <blockquote>"Leadership anchored in people and values."</blockquote>
          <p>Secure access for approved portfolio administrators and communications staff.</p>
        </div>
        <div className="auth-panel-decor" aria-hidden="true"><span>AU</span></div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in with your approved administrator account.</p>

          <div className="auth-divider"><span>secure email sign in</span></div>

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="signin-email">Email address</label>
              <p className="auth-field-helper">Fields start blank and credentials are never stored in the page.</p>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signin-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {status && <p className="auth-status auth-status--error">{status}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              <FaLock />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Need access? <Link to="/sign-up">Request an invite</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
