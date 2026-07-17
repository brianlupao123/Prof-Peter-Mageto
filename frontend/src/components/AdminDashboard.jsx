import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaRotate, FaShieldHalved } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';
import { useProfile } from '../lib/useProfile.js';

export default function AdminDashboard({ signedIn, token }) {
  const { data, reload } = useProfile();
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [status, setStatus] = useState('Ready');
  const [profileDraft, setProfileDraft] = useState({ fullName: '', title: '', email: '', phone: '', address: '', logoUrl: '', portraitUrl: '' });
  const [socialDraft, setSocialDraft] = useState({ platform: 'website', url: '' });

  const unreadCount = useMemo(() => messages.filter((message) => message.status !== 'resolved').length, [messages]);

  useEffect(() => {
    const profile = data?.profile;
    if (!profile) return;
    setProfileDraft({ fullName: profile.full_name || '', title: profile.title || '', email: profile.email || '', phone: profile.phone || '', address: profile.address || '', logoUrl: profile.logo_url || '', portraitUrl: profile.portrait_url || '' });
  }, [data]);

  const loadDashboard = async () => {
    if (!signedIn) return;
    setStatus('Loading dashboard...');
    try {
      const [messagePayload, activityPayload] = await Promise.all([
        apiFetch('/api/messages', { token }),
        apiFetch('/api/activity', { token }),
      ]);
      setMessages(messagePayload.messages || []);
      setActivity(activityPayload.activity || []);
      setStatus('Dashboard synced');
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => { loadDashboard(); }, [signedIn, token]);

  const saveProfile = async (event) => {
    event.preventDefault();
    await apiFetch('/api/profile', { method: 'PUT', token, body: JSON.stringify(profileDraft) });
    await reload();
    await loadDashboard();
  };

  const addSocial = async (event) => {
    event.preventDefault();
    await apiFetch('/api/social-links', { method: 'POST', token, body: JSON.stringify(socialDraft) });
    setSocialDraft({ platform: 'website', url: '' });
    await reload();
    await loadDashboard();
  };

  const deleteSocial = async (id) => {
    await apiFetch(`/api/social-links/${id}`, { method: 'DELETE', token });
    await reload();
    await loadDashboard();
  };

  const markResolved = async (id) => {
    await apiFetch(`/api/messages/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status: 'resolved' }) });
    await loadDashboard();
  };

  if (!signedIn) {
    return <div className="notice-panel"><FaShieldHalved /><h2>Admin dashboard locked</h2><p>Use the access portal to sign in before viewing messages, profile content, and backend tools.</p><Link className="button-link" to="/access">Sign in</Link></div>;
  }

  return (
    <div className="dashboard-grid dashboard-grid-wide">
      <section className="dashboard-panel">
        <div className="panel-heading"><div><span className="eyebrow">Profile CRUD</span><h2>Edit public profile</h2></div><button className="icon-button" type="button" onClick={loadDashboard} aria-label="Refresh dashboard"><FaRotate /></button></div>
        <form className="contact-form compact" onSubmit={saveProfile}>
          <label>Full name<input value={profileDraft.fullName} onChange={(event) => setProfileDraft((current) => ({ ...current, fullName: event.target.value }))} /></label>
          <label>Title<input value={profileDraft.title} onChange={(event) => setProfileDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Email<input value={profileDraft.email} onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))} /></label>
          <label>Phone<input value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} /></label>
          <label>Address<input value={profileDraft.address} onChange={(event) => setProfileDraft((current) => ({ ...current, address: event.target.value }))} /></label>
          <label>Logo URL<input value={profileDraft.logoUrl} onChange={(event) => setProfileDraft((current) => ({ ...current, logoUrl: event.target.value }))} /></label>
          <button className="button-link" type="submit">Save profile</button>
        </form>
      </section>

      <section className="dashboard-panel">
        <span className="eyebrow">Footer Socials</span><h2>Edit social links</h2>
        <form className="contact-form compact" onSubmit={addSocial}>
          <label>Platform<input value={socialDraft.platform} onChange={(event) => setSocialDraft((current) => ({ ...current, platform: event.target.value }))} required /></label>
          <label>URL<input value={socialDraft.url} onChange={(event) => setSocialDraft((current) => ({ ...current, url: event.target.value }))} required /></label>
          <button className="button-link" type="submit">Add social link</button>
        </form>
        <div className="update-list">{(data?.socialLinks || []).map((link) => <article key={link.id}><strong>{link.platform}</strong><p>{link.url}</p><button type="button" onClick={() => deleteSocial(link.id)}>Delete</button></article>)}</div>
      </section>

      <section className="dashboard-panel">
        <span className="eyebrow">Inbox</span><h2>{unreadCount} active message{unreadCount === 1 ? '' : 's'}</h2><p className="dashboard-status">{status}</p>
        <div className="message-list">{messages.length === 0 ? <p>No contact messages yet.</p> : messages.map((message) => <article key={message.id} className="message-item"><div><strong>{message.name}</strong><span>{message.email}</span></div><p>{message.message}</p><button type="button" onClick={() => markResolved(message.id)}><FaCheck /> Mark resolved</button></article>)}</div>
      </section>

      <section className="dashboard-panel">
        <span className="eyebrow">Activity</span><h2>Recent changes</h2>
        <div className="update-list">{activity.length === 0 ? <p>No activity yet.</p> : activity.slice(0, 8).map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.body}</p></article>)}</div>
      </section>
    </div>
  );
}
