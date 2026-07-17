import { Link } from 'react-router-dom';
import { FaBars, FaMoon, FaRightFromBracket, FaRightToBracket, FaSun } from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { useProfile } from '../lib/useProfile.js';

export default function Header({ theme, toggleTheme, signedIn, onSignOut, openSidebar }) {
  const { data } = useProfile();
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-button" type="button" onClick={openSidebar} aria-label="Toggle navigation sidebar"><FaBars /></button>
        <Link className="brand logo-brand" to="/"><Logo logoUrl={data?.profile?.logo_url} /></Link>
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Toggle light and dark mode">{theme === 'dark' ? <FaSun /> : <FaMoon />}</button>
        {signedIn ? <button className="nav-cta" type="button" onClick={onSignOut}>Sign out <FaRightFromBracket /></button> : <Link className="nav-cta" to="/access">Sign in <FaRightToBracket /></Link>}
      </div>
    </header>
  );
}
