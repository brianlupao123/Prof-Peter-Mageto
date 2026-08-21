import { useEffect, useMemo, useState } from 'react';
import { FaArrowUpRightFromSquare, FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

const typeLabels = {
  message: 'Message',
  speech: 'Speech',
  statement: 'Statement',
  address: 'Address',
};

function formatType(value) {
  return typeLabels[value] || String(value || 'Message').replace(/[_-]/g, ' ');
}

function formatDate(value) {
  if (!value) return 'Undated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Undated';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function excerpt(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 190) return text;
  return text.slice(0, 190).trim() + '...';
}

export default function Messages() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    document.title = 'Messages | Rev. Prof. Peter Mageto - Africa University';
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch('/api/office-messages')
      .then((payload) => {
        if (!active) return;
        setItems(payload.officeMessages || []);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => { active = false; };
  }, []);

  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    const dateCompare = String(b.publishedDate || '').localeCompare(String(a.publishedDate || ''));
    if (dateCompare !== 0) return dateCompare;
    return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  }), [items]);

  return (
    <>
      <section className="page-section archive-page-section">
        <span className="eyebrow">Office of the Vice Chancellor</span>
        <h1>Messages & Speeches</h1>
        <p className="lead">
          A formal archive for public messages, speeches, statements, and addresses from the Vice Chancellor's office.
        </p>
      </section>

      <section className="page-section">
        <div className="source-list" style={{ marginTop: '0.5rem' }}>
          {status === 'loading' && (
            <div className="notice-panel">
              <p style={{ margin: 0, color: 'var(--muted)' }}>Loading messages...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="notice-panel">
              <p style={{ margin: 0, color: 'var(--muted)' }}>Messages could not be loaded. Please refresh and try again.</p>
            </div>
          )}

          {status === 'ready' && sortedItems.length === 0 && (
            <div className="notice-panel">
              <p style={{ margin: 0, color: 'var(--muted)' }}>No messages published yet.</p>
            </div>
          )}

          {status === 'ready' && sortedItems.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <article key={item.id} className="source-list-item message-archive-item">
                <div className="source-list-main">
                  <div className="source-list-copy">
                    <div className="source-meta-row">
                      <span className="source-type-label">{formatType(item.type)}</span>
                      <span className="source-attribution">{formatDate(item.publishedDate)}</span>
                    </div>
                    <strong>{item.title}</strong>
                    <p style={{ margin: 0, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.6 }}>
                      {expanded ? item.body : excerpt(item.body)}
                    </p>
                    {item.sourceUrl ? (
                      <a className="message-source-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Source reference <FaArrowUpRightFromSquare aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </div>
                <button
                  className="btn-edit"
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  aria-expanded={expanded}
                >
                  {expanded ? <FaChevronUp /> : <FaChevronDown />}
                  {expanded ? 'Collapse' : 'Read more'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
