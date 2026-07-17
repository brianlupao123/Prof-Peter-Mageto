import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

const initialForm = { name: '', email: '', organization: '', message: '' };

export default function ContactForm({ signedIn, token }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', text: '' });

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', text: 'Sending message...' });

    try {
      if (token === 'local-preview-token') {
        const messages = JSON.parse(localStorage.getItem('pm-local-messages') || '[]');
        localStorage.setItem('pm-local-messages', JSON.stringify([{ ...form, id: Date.now(), status: 'new', created_at: new Date().toISOString() }, ...messages]));
      } else {
        await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm(initialForm);
      setStatus({ type: 'success', text: 'Message saved successfully. The dashboard can now review it.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    }
  };

  if (!signedIn) {
    return (
      <div className="notice-panel">
        <h2>Secure contact access</h2>
        <p>Sign in first to submit or manage messages for this leadership portfolio.</p>
        <Link className="button-link" to="/access">Open access portal</Link>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submitForm}>
      <label>Name<input name="name" value={form.name} onChange={updateField} required /></label>
      <label>Email<input name="email" type="email" value={form.email} onChange={updateField} required /></label>
      <label>Organization<input name="organization" value={form.organization} onChange={updateField} placeholder="Optional" /></label>
      <label>Message<textarea name="message" value={form.message} onChange={updateField} rows="6" required /></label>
      <button className="button-link" type="submit" disabled={status.type === 'loading'}>Send message <FaPaperPlane /></button>
      {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
    </form>
  );
}
