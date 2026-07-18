import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaEnvelope, FaShieldHalved } from 'react-icons/fa6';

export default function SignUp({ signedIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = 'Request Access | Prof. Peter Mageto Portfolio';
  }, []);

  if (signedIn) return <Navigate to="/dashboard" replace />;

  const submit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent('Portfolio dashboard access request');
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message || 'Please review this dashboard access request.'}`);
    window.location.href = `mailto:info@africau.edu?subject=${subject}&body=${body}`;
    setStatus('Your email client should open with the access request prepared.');
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand-mark">
          <span className="auth-logo-circle">PM</span>
          <div>
            <strong>Prof. Peter Mageto</strong>
            <small>Portfolio administration</small>
          </div>
        </div>
        <div className="auth-panel-quote">
          <FaShieldHalved aria-hidden="true" />
          <blockquote>Access is intentionally invite-only.</blockquote>
          <p>This protects the professor's public profile, messages, and publication records from open self-registration.</p>
        </div>
        <div className="auth-panel-decor" aria-hidden="true"><span>AU</span></div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Request access</h1>
          <p className="auth-subtitle">Send a request to be added as an approved portfolio administrator.</p>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <input id="signup-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-message">Reason for access</label>
              <textarea id="signup-message" rows="4" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Briefly explain why you need dashboard access." />
            </div>

            {status && <p className="auth-status auth-status--info">{status}</p>}

            <button className="auth-submit" type="submit">
              <FaEnvelope />
              Prepare request
            </button>
          </form>

          <p className="auth-switch">
            Already approved? <Link to="/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
