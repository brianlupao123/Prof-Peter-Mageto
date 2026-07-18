import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { apiFetch } from './lib/api.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const Leadership = lazy(() => import('./pages/Leadership.jsx'));
const Scholarship = lazy(() => import('./pages/Scholarship.jsx'));
const Strategy = lazy(() => import('./pages/Strategy.jsx'));
const Roadmap = lazy(() => import('./pages/Roadmap.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Sources = lazy(() => import('./pages/Sources.jsx'));
const Access = lazy(() => import('./pages/Access.jsx'));
const SignIn = lazy(() => import('./pages/SignIn.jsx'));
const SignUp = lazy(() => import('./pages/SignUp.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    const message = String(error?.message || '');
    const staleChunk = /Failed to fetch dynamically imported module|Importing a module script failed|module script/i.test(message);
    if (staleChunk && !sessionStorage.getItem('pm-route-reload')) {
      sessionStorage.setItem('pm-route-reload', 'true');
      window.location.reload();
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-loader route-error-panel" role="alert">
          <strong>We could not load this page after an update.</strong>
          <span>Please refresh once to get the latest version.</span>
          <button type="button" onClick={() => window.location.reload()}>Refresh page</button>
        </div>
      );
    }
    return this.props.children;
  }
}


function getInitialTheme() {
  const stored = localStorage.getItem('pm-theme');
  if (stored) return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('pm-token');
    const email = localStorage.getItem('pm-email');
    return token ? { token, email } : null;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pm-theme', theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
      metaThemeColor.setAttribute('content', bg || (theme === 'dark' ? '#0f1f1a' : '#f4f6f2'));
    }
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => { if (!localStorage.getItem('pm-theme')) setTheme(e.matches ? 'dark' : 'light'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setTheme((cur) => {
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pm-theme', next);
    return next;
  });

  const signIn = async (email, password) => {
    const normalized = String(email).trim().toLowerCase();
    const payload = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalized, password }),
    });
    const next = { token: payload.token, email: payload.user?.email || normalized };
    setSession(next);
    localStorage.setItem('pm-token', next.token);
    localStorage.setItem('pm-email', next.email);
    return next;
  };

  const signOut = () => {
    setSession(null);
    localStorage.removeItem('pm-token');
    localStorage.removeItem('pm-email');
  };

  const signedIn = Boolean(session);

  return (
    <Layout
      theme={theme}
      toggleTheme={toggleTheme}
      signedIn={signedIn}
      onSignOut={signOut}
      userEmail={session?.email}
      sidebarOpen={sidebarOpen}
      openSidebar={() => setSidebarOpen((v) => !v)}
      closeSidebar={() => setSidebarOpen(false)}
    >
      <RouteErrorBoundary>
        <Suspense fallback={<div className="page-loader">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/scholarship" element={<Scholarship />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/contact" element={<Contact signedIn={signedIn} token={session?.token} />} />
          <Route path="/sources" element={<Sources />} />

          <Route path="/access" element={<Access signedIn={signedIn} onSignIn={signIn} />} />
          <Route path="/sign-in" element={<SignIn signedIn={signedIn} onSignIn={signIn} />} />
          <Route path="/signin" element={<Navigate to="/sign-in" replace />} />
          <Route path="/login" element={<Navigate to="/sign-in" replace />} />
          <Route path="/sign-up" element={<SignUp signedIn={signedIn} />} />
          <Route path="/signup" element={<Navigate to="/sign-up" replace />} />
          <Route path="/register" element={<Navigate to="/sign-up" replace />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={signedIn ? <Dashboard signedIn={signedIn} token={session?.token} /> : <Navigate to="/access" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </Layout>
  );
}


