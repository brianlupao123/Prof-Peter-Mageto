import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaRotate, FaShieldHalved } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

export default function AdminDashboard({ signedIn, token }) {
  const [messages, setMessages] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [status, setStatus] = useState('Ready');
  const [draft, setDraft] = useState({ title: '', body: '' });

  const unreadCount = useMemo(() => messages.filter((message) => message.status !== 'resolved').length, [messages]);

  const loadDashboard = async () => {
    if (!signedIn) return;
    setStatus('Loading dashboard...');
    try {
      if (token === 'local-preview-token') {
        setMessages(JSON.parse(localStorage.getItem('pm-local-messages') || '[]'));
        setUpdates(JSON.parse(localStorage.getItem('pm-local-updates') || '[]'));
      } else {
        const [messagePayload, updatePayload] = await Promise.all([
          apiFetch('/api/messages', { token }),
          apiFetch('/api/content-updates', { token }),
        ]);
        setMessages(messagePayload.messages || []);
        setUpdates(updatePayload.updates || []);
      }
      setStatus('Dashboard synced');
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [signedIn, token]);

  const markResolved = async (id) => {
    if (token === 'local-preview-token') {
      const nextMessages = messages.map((message) => (message.id === id ? { ...message, status: 'resolved' } : message));
      setMessages(nextMessages);
      localStorage.setItem('pm-local-messages', JSON.stringify(nextMessages));
      return;
    }
    await apiFetch(`/api/messages/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status: 'resolved' }) });
    await loadDashboard();
  };

  const publishUpdate = async (event) => {
    event.preventDefault();
    const entry = { ...draft, id: Date.now(), created_at: new Date().toISOString() };
    if (token === 'local-preview-token') {
      const nextUpdates = [entry, ...updates];
      setUpdates(nextUpdates);
      localStorage.setItem('pm-local-updates', JSON.stringify(nextUpdates));
    } else {
      await apiFetch('/api/content-updates', { method: 'POST', token, body: JSON.stringify(draft) });
      await loadDashboard();
    }
    setDraft({ title: '', body: '' });
  };

  if (!signedIn) {
    return (
      <div className="notice-panel">
        <FaShieldHalved />
        <h2>Admin dashboard locked</h2>
        <p>Use the access portal to sign in before viewing messages, content updates, and backend health.</p>
        <Link className="button-link" to="/access">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">Inbox</span><h2>{unreadCount} active message{unreadCount === 1 ? '' : 's'}</h2></div>
          <button className="icon-button" type="button" onClick={loadDashboard} aria-label="Refresh dashboard"><FaRotate /></button>
        </div>
        <p className="dashboard-status">{status}</p>
        <div className="message-list">
          {messages.length === 0 ? <p>No contact messages yet.</p> : messages.map((message) => (
            <article key={message.id} className="message-item">
              <div><strong>{message.name}</strong><span>{message.email}</span></div>
              <p>{message.message}</p>
              <button type="button" onClick={() => markResolved(message.id)}><FaCheck /> Mark resolved</button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <span className="eyebrow">Content Operations</span>
        <h2>Publish approved updates</h2>
        <form className="contact-form compact" onSubmit={publishUpdate}>
          <label>Title<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required /></label>
          <label>Update<textarea rows="5" value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} required /></label>
          <button className="button-link" type="submit">Save update</button>
        </form>
        <div className="update-list">
          {updates.slice(0, 4).map((update) => <article key={update.id}><strong>{update.title}</strong><p>{update.body}</p></article>)}
        </div>
      </section>
    </div>
  );
}
