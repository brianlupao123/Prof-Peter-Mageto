import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './data/profileData.js';
import { apiFetch } from './lib/api.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const Leadership = lazy(() => import('./pages/Leadership.jsx'));
const Scholarship = lazy(() => import('./pages/Scholarship.jsx'));
const Strategy = lazy(() => import('./pages/Strategy.jsx'));
const Roadmap = lazy(() => import('./pages/Roadmap.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Sources = lazy(() => import('./pages/Sources.jsx'));
const Access = lazy(() => import('./pages/Access.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pm-theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('pm-token');
    const email = localStorage.getItem('pm-email');
    return token ? { token, email } : null;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pm-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  const signIn = async (email, password) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    try {
      const payload = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: normalizedEmail, password }) });
      const nextSession = { token: payload.token, email: payload.user?.email || normalizedEmail };
      setSession(nextSession);
      localStorage.setItem('pm-token', nextSession.token);
      localStorage.setItem('pm-email', nextSession.email);
      return nextSession;
    } catch (error) {
      if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const nextSession = { token: 'local-preview-token', email: normalizedEmail };
        setSession(nextSession);
        localStorage.setItem('pm-token', nextSession.token);
        localStorage.setItem('pm-email', nextSession.email);
        return nextSession;
      }
      throw error;
    }
  };

  const signOut = () => {
    setSession(null);
    localStorage.removeItem('pm-token');
    localStorage.removeItem('pm-email');
  };

  return (
    <Layout
      theme={theme}
      toggleTheme={toggleTheme}
      signedIn={Boolean(session)}
      onSignOut={signOut}
      sidebarOpen={sidebarOpen}
      openSidebar={() => setSidebarOpen((current) => !current)}
      closeSidebar={() => setSidebarOpen(false)}
    >
      <Suspense fallback={<div className="page-loader">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/scholarship" element={<Scholarship />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/contact" element={<Contact signedIn={Boolean(session)} token={session?.token} />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/access" element={<Access signedIn={Boolean(session)} onSignIn={signIn} />} />
          <Route path="/dashboard" element={<Dashboard signedIn={Boolean(session)} token={session?.token} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
