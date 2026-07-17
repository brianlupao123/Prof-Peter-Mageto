import Header from './Header.jsx';
import PortfolioIndex from './PortfolioIndex.jsx';
import Sidebar from './Sidebar.jsx';
import { SITE_NAME } from '../data/profileData.js';

export default function Layout({ children, theme, toggleTheme, signedIn, onSignOut, sidebarOpen, openSidebar, closeSidebar }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header theme={theme} toggleTheme={toggleTheme} signedIn={signedIn} onSignOut={onSignOut} openSidebar={openSidebar} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} signedIn={signedIn} />
      <div className="workspace-frame">
        <main id="main" className="page-main">{children}</main>
        <PortfolioIndex />
      </div>
      <footer><strong>{SITE_NAME}</strong><span>Africa University | Old Mutare, Zimbabwe | Full-stack leadership platform.</span></footer>
    </div>
  );
}
