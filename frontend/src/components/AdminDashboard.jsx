import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheck,
  FaLock,
  FaPlus,
  FaRotate,
  FaShieldHalved,
  FaTrash,
  FaUpload,
} from 'react-icons/fa6';
import { apiFetch, uploadFile } from '../lib/api.js';
import { useProfile } from '../lib/useProfile.js';

// ── Toast ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

// ── Relative time helper ───────────────────────────────────────────────────
function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── File Upload Button ─────────────────────────────────────────────────────
function UploadButton({ token, onUploaded, label = 'Upload image', accept = 'image/*' }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadFile(file, token);
      onUploaded(url);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      {preview && <img className="upload-preview" src={preview} alt="Preview" />}
      <button
        type="button"
        className="btn-edit"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <FaUpload /> {uploading ? 'Uploading…' : label}
      </button>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
    </div>
  );
}

// ── Repeatable Collection Editor ───────────────────────────────────────────
function CollectionEditor({ collection, columns, items, token, onRefresh, toast }) {
  const [drafts, setDrafts] = useState({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({});

  const startEdit = (id, item) => {
    const draft = {};
    columns.forEach(({ key }) => { draft[key] = item[key] || ''; });
    setDrafts((d) => ({ ...d, [id]: draft }));
  };

  const cancelEdit = (id) => {
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
  };

  const saveEdit = async (id) => {
    try {
      await apiFetch(`/api/${collection}/${id}`, { method: 'PUT', token, body: JSON.stringify(drafts[id]) });
      cancelEdit(id);
      await onRefresh();
      toast('Item updated ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteItem = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/${collection}/${id}`, { method: 'DELETE', token });
      await onRefresh();
      toast('Item deleted');
    } catch (e) { toast(e.message, 'error'); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/${collection}`, { method: 'POST', token, body: JSON.stringify(newItem) });
      setNewItem({});
      setAdding(false);
      await onRefresh();
      toast('Item added ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {items.length === 0 && <p style={{ color: 'var(--muted)' }}>No items yet. Add one below.</p>}
      {items.map((item) => {
        const id = item.id;
        const mainLabel = item[columns[0].key] || id;
        const isEditing = Boolean(drafts[id]);
        return (
          <div key={id} className="collection-item">
            <div>
              {isEditing
                ? columns.map(({ key, label, multiline }) => (
                    <label key={key} style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
                      {multiline
                        ? <textarea rows={2} style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={drafts[id][key] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: e.target.value } }))} />
                        : <input style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={drafts[id][key] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: e.target.value } }))} />
                      }
                    </label>
                  ))
                : columns.map(({ key, label }) => (
                    <div key={key} style={{ fontSize: '0.88rem' }}>
                      {columns.length > 1 && <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{label}: </span>}
                      {item[key]}
                    </div>
                  ))
              }
            </div>
            <div className="collection-item-actions">
              {isEditing
                ? <>
                    <button className="btn-save" type="button" onClick={() => saveEdit(id)}>Save</button>
                    <button className="btn-edit" type="button" onClick={() => cancelEdit(id)}>Cancel</button>
                  </>
                : <>
                    <button className="btn-edit" type="button" onClick={() => startEdit(id, item)}>Edit</button>
                    <button className="btn-delete" type="button" onClick={() => deleteItem(id, mainLabel)}><FaTrash /></button>
                  </>
              }
            </div>
          </div>
        );
      })}

      {adding
        ? (
          <form className="collection-item" style={{ borderColor: 'var(--brand)' }} onSubmit={addItem}>
            <div>
              {columns.map(({ key, label, multiline }) => (
                <label key={key} style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>{label} *</span>
                  {multiline
                    ? <textarea rows={2} required style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={newItem[key] || ''} onChange={(e) => setNewItem((n) => ({ ...n, [key]: e.target.value }))} />
                    : <input required style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={newItem[key] || ''} onChange={(e) => setNewItem((n) => ({ ...n, [key]: e.target.value }))} />
                  }
                </label>
              ))}
            </div>
            <div className="collection-item-actions" style={{ flexDirection: 'column' }}>
              <button className="btn-save" type="submit">Add</button>
              <button className="btn-edit" type="button" onClick={() => { setAdding(false); setNewItem({}); }}>Cancel</button>
            </div>
          </form>
        )
        : (
          <button
            className="btn-edit"
            type="button"
            onClick={() => setAdding(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', alignSelf: 'start' }}
          >
            <FaPlus /> Add item
          </button>
        )
      }
    </div>
  );
}

// ── Banner Slide Editor ────────────────────────────────────────────────────
const PAGE_KEYS = ['overview', 'leadership', 'scholarship', 'strategy', 'roadmap', 'contact', 'sources'];

function toSlideDraft(slide = {}) {
  return {
    ...slide,
    eyebrow: slide.eyebrow || '',
    heading: slide.heading || '',
    subheading: slide.subheading || '',
    panel_caption: slide.panel_caption || slide.panelCaption || '',
    background_image_url: slide.background_image_url || slide.backgroundImageUrl || '',
    cta_label: slide.cta_label || slide.ctaLabel || '',
    cta_href: slide.cta_href || slide.ctaHref || '',
    sort_order: Number(slide.sort_order ?? slide.sortOrder ?? 0),
  };
}

function toSlidePayload(slide) {
  return {
    eyebrow: slide.eyebrow || null,
    heading: slide.heading,
    subheading: slide.subheading || null,
    body: slide.body || null,
    panelCaption: slide.panel_caption || null,
    backgroundImageUrl: slide.background_image_url || null,
    ctaLabel: slide.cta_label || null,
    ctaHref: slide.cta_href || null,
    sortOrder: Number(slide.sort_order ?? 0),
  };
}

const SLIDE_FORM_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'heading', label: 'Heading *', required: true },
  { key: 'subheading', label: 'Subheading', multiline: true },
  { key: 'panel_caption', label: 'Identity card caption' },
  { key: 'background_image_url', label: 'Background image URL' },
  { key: 'cta_label', label: 'Button label' },
  { key: 'cta_href', label: 'Button link' },
];

function BannerEditor({ token, profileData, onRefresh, toast }) {
  const [activePage, setActivePage] = useState('overview');
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [newSlide, setNewSlide] = useState(toSlideDraft({ heading: '', sort_order: 0 }));
  const [adding, setAdding] = useState(false);

  const loadSlides = useCallback(async (pageKey) => {
    setLoadingSlides(true);
    try {
      const payload = await apiFetch(`/api/hero-slides/${pageKey}`);
      setSlides((payload.heroSlides || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoadingSlides(false); }
  }, [toast]);

  useEffect(() => { loadSlides(activePage); }, [activePage, loadSlides]);

  const deleteSlide = async (id) => {
    if (!window.confirm('Delete this slide? The public page may use a fallback if no database slide remains.')) return;
    try {
      await apiFetch(`/api/hero-slides/${activePage}/${id}`, { method: 'DELETE', token });
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide deleted');
    } catch (e) { toast(e.message, 'error'); }
  };

  const saveSlide = async (e) => {
    e.preventDefault();
    if (!editingSlide) return;
    try {
      await apiFetch(`/api/hero-slides/${activePage}/${editingSlide.id}`, { method: 'PUT', token, body: JSON.stringify(toSlidePayload(editingSlide)) });
      setEditingSlide(null);
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide updated');
    } catch (e) { toast(e.message, 'error'); }
  };

  const addSlide = async (e) => {
    e.preventDefault();
    try {
      const payload = toSlidePayload({ ...newSlide, sort_order: slides.length });
      await apiFetch(`/api/hero-slides/${activePage}`, { method: 'POST', token, body: JSON.stringify(payload) });
      setAdding(false);
      setNewSlide(toSlideDraft({ heading: '', sort_order: 0 }));
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide added');
    } catch (e) { toast(e.message, 'error'); }
  };

  const moveSlide = async (slide, direction) => {
    const ordered = [...slides].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const index = ordered.findIndex((item) => item.id === slide.id);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return;
    const current = toSlideDraft(ordered[index]);
    const target = toSlideDraft(ordered[swapIndex]);
    const currentOrder = current.sort_order;
    current.sort_order = target.sort_order;
    target.sort_order = currentOrder;
    try {
      await Promise.all([
        apiFetch(`/api/hero-slides/${activePage}/${current.id}`, { method: 'PUT', token, body: JSON.stringify(toSlidePayload(current)) }),
        apiFetch(`/api/hero-slides/${activePage}/${target.id}`, { method: 'PUT', token, body: JSON.stringify(toSlidePayload(target)) }),
      ]);
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide order updated');
    } catch (e) { toast(e.message, 'error'); }
  };

  const restoreMissingOverviewSlides = async () => {
    if (activePage !== 'overview') return;
    const fallbackOverview = fallbackHeroSlides.filter((slide) => slide.page_key === 'overview');
    const missing = fallbackOverview.slice(slides.length);
    if (missing.length === 0) {
      toast('Overview carousel already has all fallback slides', 'info');
      return;
    }
    if (!window.confirm(`Add ${missing.length} missing Overview carousel slide${missing.length === 1 ? '' : 's'}? Existing slides will be kept.`)) return;
    try {
      for (const [index, slide] of missing.entries()) {
        await apiFetch('/api/hero-slides/overview', {
          method: 'POST',
          token,
          body: JSON.stringify(toSlidePayload({ ...toSlideDraft(slide), sort_order: slides.length + index })),
        });
      }
      await loadSlides('overview');
      await onRefresh();
      toast('Missing Overview slides restored');
    } catch (e) { toast(e.message, 'error'); }
  };

  const renderSlideFields = (draft, setDraft) => SLIDE_FORM_FIELDS.map(({ key, label, required, multiline }) => (
    <label key={key} style={{ display: 'grid', gap: '0.2rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
      {multiline
        ? <textarea rows={2} required={required} style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={draft[key] || ''} onChange={(e) => setDraft((item) => ({ ...item, [key]: e.target.value }))} />
        : <input required={required} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={draft[key] || ''} onChange={(e) => setDraft((item) => ({ ...item, [key]: e.target.value }))} />
      }
    </label>
  ));

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {PAGE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`dashboard-tab ${activePage === key ? 'active' : ''}`}
            style={{ borderBottom: 'none', padding: '0.45rem 0.85rem', border: '1px solid var(--line)', borderRadius: '6px', background: activePage === key ? 'var(--brand-strong)' : 'var(--surface)', color: activePage === key ? '#fff' : 'var(--muted)' }}
            onClick={() => { setActivePage(key); setEditingSlide(null); setAdding(false); }}
          >
            {key}
          </button>
        ))}
      </div>

      {activePage === 'overview' && (
        <div style={{ background: 'var(--surface-strong)', border: '1px solid var(--line)', padding: '0.75rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'grid', gap: '0.7rem' }}>
          <span><strong>Overview carousel:</strong> Home works best with the full seven-slide tour.</span>
          <button className="btn-save" type="button" onClick={restoreMissingOverviewSlides} style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <FaRotate /> Restore missing Overview slides
          </button>
        </div>
      )}

      {loadingSlides && <div className="skeleton skeleton-card" style={{ marginBottom: '0.75rem' }} />}
      <p style={{ fontSize: '0.84rem', color: slides.length > 1 ? 'var(--brand-strong)' : 'var(--muted)', marginBottom: '0.75rem' }}>
        {slides.length > 1 ? `${slides.length} slides - rotation is active for this page.` : 'Add a second slide to enable auto-rotation on this page.'}
      </p>

      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
        {slides.map((slide, index) => (
          <div key={slide.id} className="collection-item">
            {editingSlide?.id === slide.id
              ? (
                <form style={{ display: 'grid', gap: '0.5rem', width: '100%' }} onSubmit={saveSlide}>
                  {renderSlideFields(editingSlide, setEditingSlide)}
                  <div style={{ marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Or upload a photo</span>
                    <UploadButton token={token} label="Upload background photo" onUploaded={(url) => setEditingSlide((item) => ({ ...item, background_image_url: url }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <button className="btn-save" type="submit">Save slide</button>
                    <button className="btn-edit" type="button" onClick={() => setEditingSlide(null)}>Cancel</button>
                  </div>
                </form>
              )
              : (
                <>
                  <div>
                    {slide.background_image_url && <img className="upload-preview" src={slide.background_image_url} alt="slide bg" />}
                    <div style={{ fontWeight: 700, marginTop: slide.background_image_url ? '0.5rem' : 0 }}>{slide.heading}</div>
                    {slide.subheading && <div style={{ fontSize: '0.84rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{slide.subheading.slice(0, 90)}{slide.subheading.length > 90 ? '...' : ''}</div>}
                    {(slide.cta_label || slide.cta_href) && <div style={{ fontSize: '0.78rem', color: 'var(--brand-strong)', marginTop: '0.35rem' }}>{slide.cta_label || 'CTA'} {'->'} {slide.cta_href || '/'}</div>}
                  </div>
                  <div className="collection-item-actions">
                    <button className="btn-edit" type="button" onClick={() => moveSlide(slide, -1)} disabled={index === 0} aria-label="Move slide up"><FaArrowUp /></button>
                    <button className="btn-edit" type="button" onClick={() => moveSlide(slide, 1)} disabled={index === slides.length - 1} aria-label="Move slide down"><FaArrowDown /></button>
                    <button className="btn-edit" type="button" onClick={() => setEditingSlide(toSlideDraft(slide))}>Edit</button>
                    <button className="btn-delete" type="button" onClick={() => deleteSlide(slide.id)}><FaTrash /></button>
                  </div>
                </>
              )
            }
          </div>
        ))}
      </div>

      {adding
        ? (
          <form className="contact-form compact" style={{ border: '1px solid var(--brand)', borderRadius: '8px' }} onSubmit={addSlide}>
            <strong style={{ fontSize: '0.9rem' }}>New slide for {activePage}</strong>
            {renderSlideFields(newSlide, setNewSlide)}
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Or upload a photo</span>
              <UploadButton token={token} label="Upload background photo" onUploaded={(url) => setNewSlide((item) => ({ ...item, background_image_url: url }))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn-save" type="submit"><FaPlus /> Add slide</button>
              <button className="btn-edit" type="button" onClick={() => { setAdding(false); setNewSlide(toSlideDraft({ heading: '', sort_order: 0 })); }}>Cancel</button>
            </div>
          </form>
        )
        : (
          <button
            className="btn-edit"
            type="button"
            onClick={() => setAdding(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <FaPlus /> Add slide to {activePage}
          </button>
        )
      }
    </div>
  );
}
// ── Main AdminDashboard ────────────────────────────────────────────────────
const TABS = ['Profile', 'Banners', 'Collections', 'Inbox', 'Activity'];

const COLLECTIONS = [
  { key: 'credentials', label: 'Credentials', columns: [{ key: 'label', label: 'Credential' }] },
  { key: 'career-entries', label: 'Career', columns: [{ key: 'role', label: 'Role' }, { key: 'place', label: 'Institution' }, { key: 'note', label: 'Note', multiline: true }] },
  { key: 'publications', label: 'Publications', columns: [{ key: 'title', label: 'Title' }] },
  { key: 'research-themes', label: 'Research Themes', columns: [{ key: 'label', label: 'Theme' }] },
  { key: 'strategy-goals', label: 'Strategy Goals', columns: [{ key: 'label', label: 'Goal' }] },
  { key: 'sources', label: 'Sources', columns: [{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }] },
  { key: 'social-links', label: 'Social Links', columns: [{ key: 'platform', label: 'Platform' }, { key: 'url', label: 'URL' }] },
];

export default function AdminDashboard({ signedIn, token }) {
  const { data, reload } = useProfile();
  const { toasts, push: toast } = useToast();

  const [activeTab, setActiveTab] = useState('Profile');
  const [activeCollection, setActiveCollection] = useState('credentials');
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [status, setStatus] = useState('Ready');

  // Profile form state
  const [profileDraft, setProfileDraft] = useState({
    fullName: '', title: '', email: '', phone: '', phoneSecondary: '', address: '', logoUrl: '', portraitUrl: '',
  });

  // Password change state
  const [pwDraft, setPwDraft] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState('');

  const unreadCount = useMemo(() => messages.filter((m) => m.status !== 'resolved').length, [messages]);

  useEffect(() => {
    const profile = data?.profile;
    if (!profile) return;
    setProfileDraft({
      fullName: profile.full_name || '',
      title: profile.title || '',
      email: profile.email || '',
      phone: profile.phone || '',
      phoneSecondary: profile.phone_secondary || '',
      address: profile.address || '',
      logoUrl: profile.logo_url || '',
      portraitUrl: profile.portrait_url || '',
    });
  }, [data]);

  const loadDashboard = useCallback(async () => {
    if (!signedIn) return;
    setStatus('Loading…');
    try {
      const [msgPayload, actPayload] = await Promise.all([
        apiFetch('/api/messages', { token }),
        apiFetch('/api/activity', { token }),
      ]);
      setMessages(msgPayload.messages || []);
      setActivity(actPayload.activity || []);
      setStatus('Synced');
    } catch (e) { setStatus(e.message); }
  }, [signedIn, token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/profile', { method: 'PUT', token, body: JSON.stringify(profileDraft) });
      await reload();
      await loadDashboard();
      toast('Profile saved ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwDraft.newPassword !== pwDraft.confirm) { setPwStatus('New passwords do not match.'); return; }
    if (pwDraft.newPassword.length < 8) { setPwStatus('New password must be at least 8 characters.'); return; }
    try {
      const payload = await apiFetch('/api/auth/password', { method: 'PUT', token, body: JSON.stringify({ currentPassword: pwDraft.currentPassword, newPassword: pwDraft.newPassword }) });
      setPwStatus(payload.message || 'Password changed.');
      setPwDraft({ currentPassword: '', newPassword: '', confirm: '' });
      toast('Password changed ✓');
    } catch (e) { setPwStatus(e.message); toast(e.message, 'error'); }
  };

  const markResolved = async (id) => {
    try {
      await apiFetch(`/api/messages/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status: 'resolved' }) });
      await loadDashboard();
      toast('Message resolved ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  if (!signedIn) {
    return (
      <div className="notice-panel">
        <FaShieldHalved />
        <h2>Admin dashboard locked</h2>
        <p>Use the access portal to sign in before managing content.</p>
        <Link className="button-link" to="/access">Sign in</Link>
      </div>
    );
  }

  const currentCollection = COLLECTIONS.find((c) => c.key === activeCollection);
  const collectionData = {
    credentials: data?.credentials ?? [],
    'career-entries': data?.careerEntries ?? [],
    publications: data?.publications ?? [],
    'research-themes': data?.researchThemes ?? [],
    'strategy-goals': data?.strategyGoals ?? [],
    sources: data?.sources ?? [],
    'social-links': data?.socialLinks ?? [],
  };

  return (
    <>
      <ToastContainer toasts={toasts} />

      {/* Tab bar */}
      <div className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Inbox' && unreadCount > 0 && (
              <span style={{ marginLeft: '0.35rem', background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', borderRadius: '999px', padding: '0.05rem 0.4rem' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          className="dashboard-tab"
          style={{ marginLeft: 'auto', color: 'var(--muted)' }}
          onClick={async () => { await reload(); await loadDashboard(); toast('Dashboard refreshed'); }}
          aria-label="Refresh dashboard"
        >
          <FaRotate /> Refresh
        </button>
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'Profile' && (
        <div className="dashboard-grid dashboard-grid-wide">
          {/* Core profile form */}
          <section className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">Core Info</span><h2>Edit public profile</h2></div></div>
            <form className="contact-form compact" onSubmit={saveProfile}>
              {[
                { key: 'fullName', label: 'Full name' },
                { key: 'title', label: 'Title' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'phoneSecondary', label: 'Secondary phone' },
                { key: 'address', label: 'Address' },
              ].map(({ key, label }) => (
                <label key={key}>
                  {label}
                  <input
                    value={profileDraft[key]}
                    onChange={(e) => setProfileDraft((d) => ({ ...d, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <div>
                <label style={{ marginBottom: '0.35rem', display: 'block', color: 'var(--muted)', fontWeight: 800 }}>Portrait photo</label>
                {profileDraft.portraitUrl && <img className="upload-preview" src={profileDraft.portraitUrl} alt="Portrait preview" style={{ marginBottom: '0.5rem' }} />}
                <UploadButton
                  token={token}
                  label="Upload portrait"
                  onUploaded={(url) => setProfileDraft((d) => ({ ...d, portraitUrl: url }))}
                />
                <input value={profileDraft.portraitUrl} onChange={(e) => setProfileDraft((d) => ({ ...d, portraitUrl: e.target.value }))} placeholder="Or paste image URL" style={{ width: '100%', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ marginBottom: '0.35rem', display: 'block', color: 'var(--muted)', fontWeight: 800 }}>Custom logo</label>
                {profileDraft.logoUrl && <img className="upload-preview" src={profileDraft.logoUrl} alt="Logo preview" style={{ marginBottom: '0.5rem' }} />}
                <UploadButton
                  token={token}
                  label="Upload logo"
                  onUploaded={(url) => setProfileDraft((d) => ({ ...d, logoUrl: url }))}
                />
                <input value={profileDraft.logoUrl} onChange={(e) => setProfileDraft((d) => ({ ...d, logoUrl: e.target.value }))} placeholder="Or paste logo URL" style={{ width: '100%', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
              <button className="button-link" type="submit">Save profile</button>
            </form>
          </section>

          {/* Change password */}
          <section className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">Security</span><h2>Change password</h2></div><FaLock /></div>
            <form className="contact-form compact" onSubmit={changePassword}>
              <label>Current password<input type="password" value={pwDraft.currentPassword} onChange={(e) => setPwDraft((d) => ({ ...d, currentPassword: e.target.value }))} required /></label>
              <label>New password (min 8 chars)<input type="password" value={pwDraft.newPassword} onChange={(e) => setPwDraft((d) => ({ ...d, newPassword: e.target.value }))} required /></label>
              <label>Confirm new password<input type="password" value={pwDraft.confirm} onChange={(e) => setPwDraft((d) => ({ ...d, confirm: e.target.value }))} required /></label>
              <button className="button-link" type="submit">Change password</button>
              {pwStatus && <p className="form-status" style={{ margin: 0 }}>{pwStatus}</p>}
            </form>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface-strong)', borderRadius: '8px', fontSize: '0.84rem', color: 'var(--muted)' }}>
              <strong>Status:</strong> {status}
            </div>
          </section>
        </div>
      )}

      {/* ── BANNERS TAB ── */}
      {activeTab === 'Banners' && (
        <section className="dashboard-panel">
          <div className="panel-heading"><div><span className="eyebrow">Hero Slides</span><h2>Manage banner slides</h2></div></div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Each page has its own hero banner. Upload a high-resolution photograph of Prof. Mageto to each slide.
            Adding a second slide to any page enables automatic rotation.
          </p>
          <BannerEditor token={token} profileData={data} onRefresh={async () => { await reload(); await loadDashboard(); }} toast={toast} />
        </section>
      )}

      {/* ── COLLECTIONS TAB ── */}
      {activeTab === 'Collections' && (
        <section className="dashboard-panel">
          <div className="panel-heading"><div><span className="eyebrow">Content Lists</span><h2>Edit content collections</h2></div></div>

          {/* Collection selector */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {COLLECTIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`dashboard-tab ${activeCollection === c.key ? 'active' : ''}`}
                style={{ borderBottom: 'none', padding: '0.4rem 0.8rem', border: '1px solid var(--line)', borderRadius: '6px', background: activeCollection === c.key ? 'var(--brand-strong)' : 'var(--surface)', color: activeCollection === c.key ? '#fff' : 'var(--muted)' }}
                onClick={() => setActiveCollection(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {currentCollection && (
            <CollectionEditor
              key={activeCollection}
              collection={activeCollection}
              columns={currentCollection.columns}
              items={collectionData[activeCollection] || []}
              token={token}
              onRefresh={async () => { await reload(); await loadDashboard(); }}
              toast={toast}
            />
          )}
        </section>
      )}

      {/* ── INBOX TAB ── */}
      {activeTab === 'Inbox' && (
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Messages</span><h2>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</h2></div>
          </div>
          <div className="message-list">
            {messages.length === 0
              ? <p style={{ color: 'var(--muted)' }}>No contact messages yet.</p>
              : messages.map((msg) => (
                <article key={msg.id} className="message-item" style={{ opacity: msg.status === 'resolved' ? 0.6 : 1 }}>
                  <div>
                    <strong>{msg.name}</strong>
                    <span>{msg.email}</span>
                  </div>
                  {msg.subject && <p style={{ fontWeight: 700, margin: '0.25rem 0', fontSize: '0.9rem' }}>{msg.subject}</p>}
                  <p>{msg.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="activity-time">{relativeTime(msg.createdAt)} — status: {msg.status}</span>
                    {msg.status !== 'resolved' && (
                      <button type="button" onClick={() => markResolved(msg.id)}>
                        <FaCheck /> Mark resolved
                      </button>
                    )}
                  </div>
                </article>
              ))
            }
          </div>
        </section>
      )}

      {/* ── ACTIVITY TAB ── */}
      {activeTab === 'Activity' && (
        <section className="dashboard-panel">
          <div className="panel-heading"><div><span className="eyebrow">Audit Trail</span><h2>Recent changes</h2></div></div>
          <div className="update-list">
            {activity.length === 0
              ? <p style={{ color: 'var(--muted)' }}>No activity recorded yet.</p>
              : activity.slice(0, 20).map((item) => (
                <article key={item.id || item.created_at}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <span className="activity-time">
                    {item.author_email || item.authorEmail} &mdash; {relativeTime(item.created_at || item.createdAt)}
                  </span>
                </article>
              ))
            }
          </div>
        </section>
      )}
    </>
  );
}


