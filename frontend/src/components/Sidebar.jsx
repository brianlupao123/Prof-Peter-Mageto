import { NavLink } from 'react-router-dom';
import { FaBookOpen, FaChartLine, FaEnvelope, FaHouse, FaLandmark, FaMap, FaNewspaper, FaShieldHalved, FaXmark } from 'react-icons/fa6';
import { navItems, SITE_NAME } from '../data/profileData.js';

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

export default function Sidebar({ open, onClose, signedIn }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Site navigation">
        <div className="sidebar-head">
          <div className="brand sidebar-brand"><span>PM</span><strong>{SITE_NAME}</strong></div>
          <button className="icon-button close-sidebar" type="button" onClick={onClose} aria-label="Close navigation"><FaXmark /></button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = navIcons[item.to] || FaNewspaper;
            return <NavLink key={item.to} to={item.to} onClick={onClose}><Icon /><span>{item.label}</span></NavLink>;
          })}
          <NavLink to="/access" onClick={onClose}><FaShieldHalved /><span>{signedIn ? 'Account' : 'Sign in'}</span></NavLink>
        </nav>
        <div className="sidebar-footer">
          <strong>Office of the Vice Chancellor</strong>
          <span>Africa University | Old Mutare, Zimbabwe</span>
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" type="button" aria-label="Close navigation backdrop" onClick={onClose} />}
    </>
  );
}
