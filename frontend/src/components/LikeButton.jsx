import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

export default function LikeButton({ pageKey }) {
  const storageKey = `liked-${pageKey}`;
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(() => localStorage.getItem(storageKey) === 'true');
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

  const likePage = async () => {
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

  return (
    <section className="page-like-bar" aria-label="Page appreciation">
      <button type="button" onClick={likePage} disabled={liked || loading} aria-pressed={liked}>
        <FaHeart />
        <span>{liked ? 'Appreciated' : 'Appreciate this page'}</span>
      </button>
      <span>{loading ? 'Loading count...' : `${count} ${count === 1 ? 'appreciation' : 'appreciations'}`}</span>
    </section>
  );
}
