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
    setStatus({ type: 'loading', text: 'Sending message…' });

    try {
      if (token === 'local-preview-token') {
        const messages = JSON.parse(localStorage.getItem('pm-local-messages') || '[]');
        localStorage.setItem('pm-local-messages', JSON.stringify([{ ...form, id: Date.now(), status: 'new', created_at: new Date().toISOString() }, ...messages]));
      } else {
        await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm(initialForm);
      setStatus({ type: 'success', text: '✓ Message received. The office will be in touch.' });
    } catch (error) {
      // Friendly rate-limit message
      if (error.message.includes('429') || error.message.toLowerCase().includes('too many')) {
        setStatus({ type: 'error', text: "You've sent several messages in a short time. Please wait a moment before trying again." });
      } else {
        setStatus({ type: 'error', text: error.message });
      }
    }
  };

  if (!signedIn) {
    return (
      <div className="notice-panel">
        <h2>Secure contact access</h2>
        <p>Sign in to submit a message directly to the Office of the Vice Chancellor's inbox.</p>
        <Link className="button-link" to="/access">Open access portal</Link>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submitForm}>
      <label>Full name <input name="name" value={form.name} onChange={updateField} required /></label>
      <label>Email address <input name="email" type="email" value={form.email} onChange={updateField} required /></label>
      <label>Organization <input name="organization" value={form.organization} onChange={updateField} placeholder="Optional" /></label>
      <label>Message <textarea name="message" value={form.message} onChange={updateField} rows="6" required /></label>
      <button className="button-link" type="submit" disabled={status.type === 'loading'}>
        Send message <FaPaperPlane />
      </button>
      {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
    </form>
  );
}
