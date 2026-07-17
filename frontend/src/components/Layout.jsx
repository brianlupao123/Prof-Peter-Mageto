import Header from './Header.jsx';
import Logo from './Logo.jsx';
import Sidebar from './Sidebar.jsx';
import { useProfile } from '../lib/useProfile.js';

const SOCIAL_LABEL = {
  linkedin: 'LinkedIn',
  twitter: 'X',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  website: 'Website',
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
        <div className="footer-brand"><Logo size={32} logoUrl={data?.profile?.logo_url} /><span>Africa University | Old Mutare, Zimbabwe | Full-stack leadership platform.</span></div>
        {socialLinks.length > 0 && <nav className="footer-social" aria-label="Social media links">{socialLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer">{SOCIAL_LABEL[link.platform] || link.platform}</a>)}</nav>}
      </footer>
    </div>
  );
}
