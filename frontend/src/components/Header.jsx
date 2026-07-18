import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaMagnifyingGlass, FaUser, FaRightFromBracket, FaGaugeHigh } from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { useProfile } from '../lib/useProfile.js';

export default function Header({ theme, toggleTheme, signedIn, onSignOut, openSidebar, userEmail }) {
  const { data } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Simple navigation-based search
    const q = searchQuery.toLowerCase();
    if (q.includes('leader')) navigate('/leadership');
    else if (q.includes('scholar') || q.includes('research')) navigate('/scholarship');
    else if (q.includes('strat')) navigate('/strategy');
    else if (q.includes('road') || q.includes('plan')) navigate('/roadmap');
    else if (q.includes('contact') || q.includes('reach')) navigate('/contact');
    else if (q.includes('source')) navigate('/sources');
    else navigate('/');
    setSearchQuery('');
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
      <form className="header-search" onSubmit={handleSearch} role="search" aria-label="Site search">
        <FaMagnifyingGlass style={{ flexShrink: 0, opacity: 0.45 }} />
        <input
          type="search"
          placeholder="Search pages — Leadership, Scholarship, Strategy…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search the site"
        />
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
          <Link className="nav-cta" to="/sign-in">Sign in →</Link>
        )}
      </div>
    </header>
  );
}


