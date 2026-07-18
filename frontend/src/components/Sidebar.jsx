import { NavLink } from 'react-router-dom';
import {
  FaBookOpen, FaChartLine, FaEnvelope, FaHouse, FaLandmark,
  FaMap, FaNewspaper, FaShieldHalved, FaXmark, FaRightToBracket,
} from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { useProfile } from '../lib/useProfile.js';
import { navItems } from '../data/profileData.js';

const navIcons = {
  '/': FaHouse,
  '/leadership': FaLandmark,
  '/scholarship': FaBookOpen,
  '/strategy': FaChartLine,
  '/roadmap': FaMap,
  '/contact': FaEnvelope,
  '/sources': FaNewspaper,
  '/dashboard': FaShieldHalved,
};

const publicNavItems = navItems.filter((item) => item.to !== '/dashboard');

export default function Sidebar({ open, onClose, signedIn }) {
  const { data } = useProfile();

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Site navigation">
        {/* Clean header — just logo + close button */}
        <div className="sidebar-head">
          <Logo logoUrl={data?.profile?.logo_url} compact />
          <button className="icon-button close-sidebar" type="button" onClick={onClose} aria-label="Close navigation">
            <FaXmark />
          </button>
        </div>

        <nav className="sidebar-nav">
          {publicNavItems.map((item) => {
            const Icon = navIcons[item.to] || FaNewspaper;
            return (
              <NavLink key={item.to} to={item.to} onClick={onClose}>
                <Icon /><span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Dashboard — only when signed in */}
          {signedIn && (
            <NavLink to="/dashboard" onClick={onClose}>
              <FaShieldHalved /><span>Dashboard</span>
            </NavLink>
          )}

          {/* Sign in / Account */}
          <NavLink to={signedIn ? '/dashboard' : '/sign-in'} onClick={onClose} className="sidebar-signin-link">
            <FaRightToBracket />
            <span>{signedIn ? 'My Account' : 'Sign in'}</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <strong>Office of the Vice Chancellor</strong>
          <span>Africa University | Old Mutare, Zimbabwe</span>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
    </>
  );
}


