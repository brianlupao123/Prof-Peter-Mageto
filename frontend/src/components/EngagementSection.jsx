import { useEffect, useState } from 'react';
import { FaHeart, FaComment, FaShare, FaPlay, FaBookOpen, FaUserTie, FaArrowRight } from 'react-icons/fa6';

const STORAGE_KEY = 'pm-engagement';

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export default function EngagementSection({ pageKey = 'home', baseLikes = 142, showCommentBox = true }) {
  const [state, setState] = useState(() => {
    const stored = loadState();
    return {
      liked: Boolean(stored[pageKey + '-liked']),
      likes: (stored[pageKey + '-likes']) || baseLikes,
      comments: stored[pageKey + '-comments'] || [],
      commentText: '',
      showComments: false,
      shared: false,
      advertPlayed: Boolean(stored[pageKey + '-advert']),
      demoRequested: Boolean(stored[pageKey + '-demo']),
      systemRequested: Boolean(stored[pageKey + '-system']),
    };
  });

  const save = (next) => {
    const stored = loadState();
    stored[pageKey + '-liked'] = next.liked;
    stored[pageKey + '-likes'] = next.likes;
    stored[pageKey + '-comments'] = next.comments;
    stored[pageKey + '-advert'] = next.advertPlayed;
    stored[pageKey + '-demo'] = next.demoRequested;
    stored[pageKey + '-system'] = next.systemRequested;
    saveState(stored);
  };

  const toggleLike = () => {
    const next = {
      ...state,
      liked: !state.liked,
      likes: state.liked ? state.likes - 1 : state.likes + 1,
    };
    setState(next);
    save(next);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setState((s) => ({ ...s, shared: true }));
      setTimeout(() => setState((s) => ({ ...s, shared: false })), 2500);
    }
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!state.commentText.trim()) return;
    const next = {
      ...state,
      comments: [
        { id: Date.now(), text: state.commentText.trim(), time: new Date().toLocaleString() },
        ...state.comments,
      ],
      commentText: '',
    };
    setState(next);
    save(next);
  };

  const playAdvert = () => {
    const next = { ...state, advertPlayed: true };
    setState(next);
    save(next);
    window.open('https://africau.edu', '_blank', 'noopener');
  };

  const requestDemo = () => {
    const next = { ...state, demoRequested: true };
    setState(next);
    save(next);
    window.open('/contact', '_self');
  };

  const requestSpeaking = () => {
    const next = { ...state, systemRequested: true };
    setState(next);
    save(next);
    window.open('/contact', '_self');
  };

  const readPublications = () => {
    const next = { ...state, demoRequested: true };
    setState(next);
    save(next);
    window.open('/scholarship', '_self');
  };

  return (
    <section className="engagement-section">
      {/* Primary actions row */}
      <div className="engagement-bar">
        <button
          className={`engage-btn engage-btn--like ${state.liked ? 'active' : ''}`}
          onClick={toggleLike}
          aria-pressed={state.liked}
        >
          <FaHeart />
          <span>{state.liked ? 'Liked' : 'Like'}</span>
          <span className="engage-count">{state.likes}</span>
        </button>

        <button
          className={`engage-btn ${state.showComments ? 'active' : ''}`}
          onClick={() => setState((s) => ({ ...s, showComments: !s.showComments }))}
        >
          <FaComment />
          <span>Comment</span>
          {state.comments.length > 0 && <span className="engage-count">{state.comments.length}</span>}
        </button>

        <button className={`engage-btn ${state.shared ? 'active' : ''}`} onClick={share}>
          <FaShare />
          <span>{state.shared ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Secondary project action row */}
      <div className="engagement-actions">
        <button
          className={`project-action-btn ${state.advertPlayed ? 'done' : ''}`}
          onClick={playAdvert}
        >
          <FaPlay />
          {state.advertPlayed ? 'Viewed ✓' : 'Watch Address'}
        </button>

        <button
          className={`project-action-btn ${state.demoRequested ? 'done' : ''}`}
          onClick={readPublications}
        >
          <FaBookOpen />
          {state.demoRequested ? 'Viewed ✓' : 'Read Publications'}
          <FaArrowRight />
        </button>

        <button
          className={`project-action-btn ${state.systemRequested ? 'done' : ''}`}
          onClick={requestSpeaking}
        >
          <FaUserTie />
          {state.systemRequested ? 'Requested ✓' : 'Invite for Speaking'}
          <FaArrowRight />
        </button>
      </div>

      {/* Comment box */}
      {showCommentBox && state.showComments && (
        <div className="engagement-comments">
          <form className="comment-form" onSubmit={addComment}>
            <input
              type="text"
              placeholder="Write a comment…"
              value={state.commentText}
              onChange={(e) => setState((s) => ({ ...s, commentText: e.target.value }))}
              maxLength={280}
            />
            <button type="submit">Post</button>
          </form>

          {state.comments.length === 0 ? (
            <p className="engagement-empty">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <ul className="comment-list">
              {state.comments.map((c) => (
                <li key={c.id} className="comment-item">
                  <span className="comment-avatar">U</span>
                  <div>
                    <p className="comment-text">{c.text}</p>
                    <time className="comment-time">{c.time}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
