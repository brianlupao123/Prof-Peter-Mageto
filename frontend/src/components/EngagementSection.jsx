import { useEffect, useState } from 'react';
import { FaArrowRight, FaEnvelope, FaHeart, FaShare } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

export default function EngagementSection({ pageKey = 'overview', contactHref = '/contact' }) {
  const storageKey = `liked-${pageKey}`;
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(() => localStorage.getItem(storageKey) === 'true');
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch(`/api/likes/${pageKey}`)
      .then((payload) => { if (active) setCount(Number(payload.count || 0)); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pageKey]);

  const appreciate = async () => {
    if (liked) return;
    setLiked(true);
    localStorage.setItem(storageKey, 'true');
    try {
      const payload = await apiFetch(`/api/likes/${pageKey}`, { method: 'POST' });
      setCount(Number(payload.count || 0));
    } catch (_error) {
      setLiked(false);
      localStorage.removeItem(storageKey);
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (_error) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch (_error) {}
  };

  return (
    <section className="engagement-section" aria-label="Page engagement">
      <div className="engagement-bar">
        <button className={`engage-btn engage-btn--like ${liked ? 'active' : ''}`} type="button" onClick={appreciate} disabled={liked || loading} aria-pressed={liked}>
          <FaHeart />
          <span>{liked ? 'Appreciated' : 'Appreciate'}</span>
          <span className="engage-count">{loading ? '...' : count}</span>
        </button>
        <button className={`engage-btn ${shared ? 'active' : ''}`} type="button" onClick={share}>
          <FaShare />
          <span>{shared ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      <div className="engagement-actions">
        <a className="project-action-btn" href={contactHref}>
          <FaEnvelope />
          Contact the office
          <FaArrowRight />
        </a>
      </div>
    </section>
  );
}
