import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaMagnifyingGlass, FaRightFromBracket, FaGaugeHigh } from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { navItems } from '../data/profileData.js';
import { useProfile } from '../lib/useProfile.js';

const officeSearchItems = [
  { to: '/contact?request=meeting#contact-form', label: 'Request meeting', summary: 'Send a meeting request to the office', keywords: 'meeting appointment request office vice chancellor' },
  { to: '/contact?request=speaking#contact-form', label: 'Invite to speak', summary: 'Send a speaking or event invitation', keywords: 'speech speaking invite event keynote address' },
  { to: '/contact?request=media#contact-form', label: 'Media enquiry', summary: 'Ask for biography, source, or media confirmation', keywords: 'media press biography verify verification source' },
  { to: '/messages', label: 'Messages & Speeches', summary: 'Read public VC messages, speeches, and statements', keywords: 'message speech statement address archive public' },
];

const searchItems = [
  ...navItems
    .filter((item) => item.to !== '/dashboard')
    .map((item) => ({ ...item, keywords: `${item.label} ${item.summary}` })),
  ...officeSearchItems,
];

function matchSearchItems(query) {
  const q = query.trim().toLowerCase();
  if (!q) return searchItems.slice(0, 5);
  return searchItems
    .map((item) => {
      const haystack = `${item.label} ${item.summary} ${item.keywords || ''}`.toLowerCase();
      const starts = item.label.toLowerCase().startsWith(q) ? 3 : 0;
      const includes = haystack.includes(q) ? 2 : 0;
      const words = q.split(/\s+/).filter(Boolean).reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
      return { ...item, score: starts + includes + words };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, 6);
}

export default function Header({ theme, toggleTheme, signedIn, onSignOut, openSidebar, userEmail }) {
  const { data } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close menus when clicking outside.
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = matchSearchItems(searchQuery);
  const goToSearchItem = (item) => {
    if (!item) return;
    navigate(item.to);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearchItem(results[0] || searchItems[0]);
  };

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="app-header">
      {/* LEFT: Hamburger + Logo */}
      <div className="header-left">
        <button className="icon-button" type="button" onClick={openSidebar} aria-label="Toggle navigation">
          <FaBars />
        </button>
        <Link className="brand logo-brand" to="/">
          <Logo logoUrl={data?.profile?.logo_url} />
        </Link>
      </div>

      {/* CENTER: Search bar (hidden on mobile) */}
      <form className="header-search" onSubmit={handleSearch} role="search" aria-label="Site search" ref={searchRef}>
        <FaMagnifyingGlass style={{ flexShrink: 0, opacity: 0.45 }} />
        <input
          type="search"
          placeholder="Search pages, speeches, sources, requests..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSearchOpen(false);
              e.currentTarget.blur();
            }
          }}
          aria-label="Search the site"
          aria-expanded={searchOpen}
          aria-controls="header-search-results"
        />
        <button className="header-search-submit" type="submit">Go</button>
        {searchOpen && (
          <div className="header-search-results" id="header-search-results">
            {results.length > 0 ? results.map((item) => (
              <button key={`${item.label}-${item.to}`} type="button" onClick={() => goToSearchItem(item)}>
                <strong>{item.label}</strong>
                <span>{item.summary}</span>
              </button>
            )) : (
              <button type="button" onClick={() => goToSearchItem({ to: '/contact', label: 'Contact', summary: 'Send a request to the office' })}>
                <strong>No direct match</strong>
                <span>Open Contact to send a specific office request.</span>
              </button>
            )}
          </div>
        )}
      </form>

      {/* RIGHT: Dark/Light → Profile/Sign-in */}
      <div className="header-actions">
        <button
          className="icon-button"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        {signedIn ? (
          <div className="profile-dropdown-wrap" ref={profileRef}>
            <button
              className="profile-avatar-btn"
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <span className="profile-avatar-circle">{initials}</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-info">
                  <span className="profile-avatar-circle profile-avatar-circle--lg">{initials}</span>
                  <div>
                    <strong>{userEmail}</strong>
                    <small>Signed in</small>
                  </div>
                </div>
                <Link className="profile-dropdown-item" to="/dashboard" onClick={() => setProfileOpen(false)}>
                  <FaGaugeHigh /> Dashboard
                </Link>
                <button
                  className="profile-dropdown-item profile-dropdown-item--danger"
                  type="button"
                  onClick={() => { onSignOut(); setProfileOpen(false); }}
                >
                  <FaRightFromBracket /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link className="nav-cta" to="/contact#contact-form" aria-label="Contact the office">
            <span className="nav-cta-full">Contact office</span>
            <span className="nav-cta-short">Contact</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </header>
  );
}


