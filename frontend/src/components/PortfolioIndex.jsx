import { NavLink, useLocation } from 'react-router-dom';
import { FaBookOpen, FaChartLine, FaEnvelope, FaLandmark, FaNewspaper, FaShieldHalved } from 'react-icons/fa6';
import { navItems } from '../data/profileData.js';

const indexIcons = {
  '/leadership': FaLandmark,
  '/scholarship': FaBookOpen,
  '/strategy': FaChartLine,
  '/contact': FaEnvelope,
  '/sources': FaNewspaper,
  '/dashboard': FaShieldHalved,
};

export default function PortfolioIndex() {
  const location = useLocation();
  const items = navItems.filter((item) => item.to !== '/' && item.to !== '/roadmap');
  const current = Math.max(items.findIndex((item) => item.to === location.pathname) + 1, 1);

  return (
    <aside className="portfolio-index" aria-label="Portfolio index">
      <div className="index-head">
        <strong>Portfolio Index</strong>
        <span>{current} / {items.length}</span>
      </div>
      <nav>
        {items.map((item) => {
          const Icon = indexIcons[item.to] || FaNewspaper;
          return (
            <NavLink key={item.to} to={item.to}>
              <span className="index-thumb"><Icon /></span>
              <span><strong>{item.label}</strong><small>{item.summary}</small></span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
