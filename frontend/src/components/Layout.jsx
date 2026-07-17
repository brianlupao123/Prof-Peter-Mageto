import {
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import Header from './Header.jsx';
import Logo from './Logo.jsx';
import Sidebar from './Sidebar.jsx';
import { SITE_NAME } from '../data/profileData.js';
import { useProfile } from '../lib/useProfile.js';

const SOCIAL_ICON = {
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  x: FaXTwitter,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  website: FaGlobe,
};

export default function Layout({ children, theme, toggleTheme, signedIn, onSignOut, sidebarOpen, openSidebar, closeSidebar }) {
  const { data } = useProfile();
  const socialLinks = data?.socialLinks ?? [];

  return (
    <div className={`app-shell calm-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header theme={theme} toggleTheme={toggleTheme} signedIn={signedIn} onSignOut={onSignOut} openSidebar={openSidebar} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} signedIn={signedIn} />
      <main id="main" className="page-main">{children}</main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo size={32} logoUrl={data?.profile?.logo_url} />
            <span>Africa University | Old Mutare, Zimbabwe</span>
          </div>
          {socialLinks.length > 0 && (
            <nav className="footer-social" aria-label="Social media links">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICON[link.platform?.toLowerCase()] || FaGlobe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
                  >
                    <Icon />
                  </a>
                );
              })}
            </nav>
          )}
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">
            &copy; {new Date().getFullYear()} Rev. Prof. Peter Mageto &mdash; {SITE_NAME}
          </span>
          <a className="back-to-top" href="#root" aria-label="Back to top">
            ↑ Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
