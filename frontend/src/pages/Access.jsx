import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../data/profileData.js';

export default function Access({ signedIn, onSignIn }) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [status, setStatus] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('Checking credentials...');
    try {
      await onSignIn(email, password);
      setStatus('Signed in');
    } catch (error) {
      setStatus(error.message);
    }
  };

  if (signedIn) return <Navigate to="/dashboard" replace />;

  return (
    <section className="page-section access-page">
      <div>
        <span className="eyebrow">Secure Access</span>
        <h1>Admin sign in for the leadership portfolio.</h1>
        <p className="lead">Use the approved credential to test dashboard access, message review, and content update workflows before attaching permanent production identity.</p>
      </div>
      <form className="contact-form access-form" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button className="button-link" type="submit">Sign in</button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}
