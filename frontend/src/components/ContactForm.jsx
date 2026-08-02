import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';
import RequestTypeSelect, { getRequestTypeLabel, requestTypes } from './RequestTypeSelect.jsx';

const initialForm = { name: '', email: '', organization: '', requestType: 'message', message: '', website: '' };

export default function ContactForm({ signedIn, token }) {
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get('request');
  const selectedType = requestTypes[requestedType] ? requestedType : 'message';
  const [form, setForm] = useState({ ...initialForm, requestType: selectedType });
  const [status, setStatus] = useState({ type: 'idle', text: '' });

  useEffect(() => {
    setForm((current) => ({ ...current, requestType: selectedType }));
  }, [selectedType]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', text: 'Sending request...' });

    const subject = getRequestTypeLabel(form.requestType);
    const officeMessage = [
      `[Request type: ${subject}]`,
      form.organization ? `[Organization: ${form.organization}]` : '',
      '',
      form.message.trim(),
    ].filter(Boolean).join('\n');
    const payload = {
      ...form,
      subject: `${subject}${form.organization ? ` - ${form.organization}` : ''}`,
      message: officeMessage,
    };

    try {
      if (token === 'local-preview-token') {
        const messages = JSON.parse(localStorage.getItem('pm-local-messages') || '[]');
        localStorage.setItem(
          'pm-local-messages',
          JSON.stringify([{ ...payload, id: Date.now(), status: 'new', created_at: new Date().toISOString() }, ...messages]),
        );
      } else {
        await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm({ ...initialForm, requestType: selectedType });
      setStatus({ type: 'success', text: 'Request received. The office will be in touch.' });
    } catch (error) {
      if (error.message.includes('429') || error.message.toLowerCase().includes('too many')) {
        setStatus({ type: 'error', text: "You've sent several messages in a short time. Please wait a moment before trying again." });
      } else {
        setStatus({ type: 'error', text: error.message });
      }
    }
  };

  return (
    <form className="contact-form" onSubmit={submitForm}>
      <label>Full name <input name="name" value={form.name} onChange={updateField} required /></label>
      <label>Email address <input name="email" type="email" value={form.email} onChange={updateField} required /></label>
      <label>Organization <input name="organization" value={form.organization} onChange={updateField} placeholder="Optional" /></label>
      <RequestTypeSelect value={form.requestType} onChange={updateField} />
      <label className="website-field" aria-hidden="true">Website <input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
      <label>Message <textarea name="message" value={form.message} onChange={updateField} rows="6" required /></label>
      <button className="button-link" type="submit" disabled={status.type === 'loading'}>
        Send request <FaPaperPlane />
      </button>
      {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
      {!signedIn && (
        <p className="contact-admin-note">
          Public requests are delivered to the admin inbox. Staff can <Link to="/access">sign in</Link> to review, assign, and update message status.
        </p>
      )}
    </form>
  );
}
