import { useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBars,
  FaBookOpen,
  FaBuildingColumns,
  FaEnvelope,
  FaGlobe,
  FaGraduationCap,
  FaHandshake,
  FaLandmark,
  FaLocationDot,
  FaMoon,
  FaPhone,
  FaQuoteLeft,
  FaRightFromBracket,
  FaRightToBracket,
  FaScaleBalanced,
  FaSun,
  FaUserTie,
  FaXmark,
} from 'react-icons/fa6';

const SITE_NAME = 'The Peter Mageto Leadership Portfolio';
const SIGN_IN_EMAIL = 'profmagteo@gmail.com';
const SIGN_IN_PASSWORD = 'Test@123';

const profileImage =
  'https://www.umnews.org/-/media/umc-media/2022/10/19/16/15/peter-mageto.jpg';

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'impact', label: 'Impact' },
  { id: 'scholarship', label: 'Scholarship' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'contact', label: 'Contact' },
  { id: 'sources', label: 'Sources' },
  { id: 'dashboard', label: 'Dashboard' },
];

const highlights = [
  { value: '5th', label: 'Vice Chancellor of Africa University' },
  { value: '25+', label: 'Years in ministry and higher education' },
  { value: '2023-2027', label: 'Strategic plan leadership period' },
  { value: 'Pan-African', label: 'Institutional identity and mission' },
];

const credentials = [
  'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA',
  'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA',
  "Bachelor of Divinity, St Paul's United Theological College, Kenya",
  'Postgraduate certificate in African Studies, Northwestern University',
];

const career = [
  {
    role: 'Vice Chancellor',
    place: 'Africa University, Zimbabwe',
    note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.',
  },
  {
    role: 'Deputy Vice Chancellor and Interim Vice Chancellor',
    place: 'Africa University',
    note: 'Served in senior academic leadership before his installation as Vice Chancellor.',
  },
  {
    role: 'Vice Chancellor and Professor of Ethics',
    place: 'University of Kigali, Rwanda',
    note: 'Advanced institutional leadership, academic quality, and ethical scholarship.',
  },
  {
    role: 'Academic Leader and Ethics Scholar',
    place: 'Kenya Methodist University, Daystar University, University of Evansville',
    note: 'Held roles across academic affairs, student welfare, ethics teaching, and departmental leadership.',
  },
];

const strategyGoals = [
  'Enhance student access and success',
  'Invest in and empower staff',
  'Increase financial stewardship and institutional sustainability',
  'Cultivate strategic partnerships and economic competitiveness',
  'Internationalize research, teaching, and learning',
];

const leadershipFocus = [
  {
    title: 'Student access and success',
    text: 'Positioning the university to support student opportunity, retention, learning quality, and graduate impact.',
  },
  {
    title: 'Values-led governance',
    text: 'Connecting institutional decisions to ethics, accountability, community, and Africa University values.',
  },
  {
    title: 'Research internationalization',
    text: 'Strengthening teaching, research, and partnerships that connect Africa University to the continent and the world.',
  },
  {
    title: 'Sustainable growth',
    text: 'Prioritizing stewardship, partnerships, and financial sustainability for long-term institutional resilience.',
  },
];

const stakeholderPaths = [
  'Prospective students and families seeking an institutional leadership profile',
  'Partners and donors evaluating strategic direction and credibility',
  'Media teams looking for verified biography, role, and contact information',
  'Academic collaborators reviewing scholarship, ethics, and leadership background',
];

const researchThemes = ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation'];

const publications = [
  'Victim Theology',
  'Corporate and personal ethics for sustainable development',
  'Book Review: European Traditions in the Study of Religion in Africa',
];

const roadmap = [
  'Client-approved portrait, biography, speeches, awards, and media assets',
  'Dedicated pages for biography, publications, speeches, media, and gallery',
  'Secure Neon-backed admin CMS for communications staff to update approved content',
  'Official contact form with spam protection, inbox workflow, and email delivery',
  'Custom domain, analytics, sitemap, performance review, and launch checklist',
];

const dashboardItems = [
  { label: 'Content approval', value: 'Pending client review' },
  { label: 'Brand name', value: SITE_NAME },
  { label: 'Current release', value: 'V1 executive portfolio' },
  { label: 'Next milestone', value: 'Official assets and domain' },
];

const sources = [
  {
    label: 'Africa University official Vice Chancellor profile',
    url: 'https://africau.edu/about/vice-chancellor/',
  },
  {
    label: 'UM News profile on Prof. Mageto',
    url: 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university',
  },
  {
    label: 'Africa University 2023/27 Strategic Plan launch',
    url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/',
  },
  {
    label: 'Africa University official contact page',
    url: 'https://africau.edu/about/contact-us/',
  },
];

function IconCard({ icon: Icon, title, children }) {
  return (
    <article className="icon-card">
      <span className="icon-wrap"><Icon /></span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function ContactForm({ signedIn, token }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  async function submitMessage(event) {
    event.preventDefault();
    const payload = {
      name: name || SIGN_IN_EMAIL,
      email: SIGN_IN_EMAIL,
      subject: 'Leadership portfolio enquiry',
      message,
    };
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('API contact save failed');
    } catch (_error) {
      const existing = JSON.parse(localStorage.getItem('mageto-messages') || '[]');
      localStorage.setItem(
        'mageto-messages',
        JSON.stringify([{ ...payload, createdAt: new Date().toISOString() }, ...existing]),
      );
    }
    setName('');
    setMessage('');
    setStatus('sent');
  }

  if (!signedIn) {
    return (
      <div className="contact-form-gate">
        <h3>Office message preview</h3>
        <p>Sign in with the client preview credentials to unlock the message form.</p>
        <a href="#access">Go to sign in <FaArrowRight /></a>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="form-success">
        <h3>Message saved locally for preview.</h3>
        <p>A production version should connect this form to Supabase or an approved office email workflow.</p>
        <button type="button" onClick={() => setStatus('idle')}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submitMessage}>
      <label>
        Your name
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Prof. Mageto office visitor" />
      </label>
      <label>
        Message
        <textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would you like to reach the office about?" />
      </label>
      <button type="submit">Send preview message <FaArrowRight /></button>
    </form>
  );
}

function AdminDashboard({ signedIn, token }) {
  const [messages, setMessages] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('idle');

  async function loadDashboard() {
    if (!signedIn || !token || token === 'local-preview-token') return;
    try {
      const headers = { Authorization: 'Bearer ' + token };
      const [messageRes, updateRes] = await Promise.all([
        fetch('/api/messages', { headers }),
        fetch('/api/content-updates'),
      ]);
      if (messageRes.ok) setMessages((await messageRes.json()).messages || []);
      if (updateRes.ok) setUpdates((await updateRes.json()).updates || []);
    } catch (_error) {
      setStatus('Dashboard API unavailable. Local preview still works.');
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [signedIn, token]);

  async function updateMessageStatus(id, nextStatus) {
    try {
      const response = await fetch('/api/messages/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error('Status update failed');
      await loadDashboard();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function createUpdate(event) {
    event.preventDefault();
    try {
      const response = await fetch('/api/content-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title, body }),
      });
      if (!response.ok) throw new Error('Could not publish update');
      setTitle('');
      setBody('');
      setStatus('Content update saved.');
      await loadDashboard();
    } catch (error) {
      setStatus(error.message);
    }
  }

  if (!signedIn) {
    return (
      <section className="admin-section" id="dashboard">
        <div className="section-head"><span className="eyebrow">Admin Dashboard</span><h2>Sign in to manage the system.</h2></div>
      </section>
    );
  }

  return (
    <section className="admin-section" id="dashboard">
      <div className="section-head">
        <span className="eyebrow">Admin Dashboard</span>
        <h2>Inbox, content updates, and launch operations.</h2>
        <p>Backend-backed when deployed with Neon. Local fallback remains available for preview.</p>
      </div>
      <div className="admin-grid">
        <article className="admin-panel">
          <h3>Office messages</h3>
          {messages.length ? messages.map((item) => (
            <div className="message-row" key={item.id}>
              <div><strong>{item.subject}</strong><span>{item.name} � {item.email}</span><p>{item.message}</p></div>
              <select value={item.status} onChange={(event) => updateMessageStatus(item.id, event.target.value)}>
                <option value="new">new</option>
                <option value="read">read</option>
                <option value="replied">replied</option>
                <option value="archived">archived</option>
              </select>
            </div>
          )) : <p>No backend messages yet. Submit the contact form after signing in to test it.</p>}
        </article>
        <article className="admin-panel">
          <h3>Publish content update</h3>
          <form className="contact-form" onSubmit={createUpdate}>
            <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <label>Update<textarea value={body} onChange={(event) => setBody(event.target.value)} required rows={4} /></label>
            <button type="submit">Save update</button>
          </form>
          {status !== 'idle' && <p className="auth-message">{status}</p>}
          <div className="updates-list">
            {updates.map((item) => <div key={item.id}><strong>{item.title}</strong><p>{item.body}</p></div>)}
          </div>
        </article>
      </div>
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('mageto-theme') || 'light');
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem('mageto-auth') === 'signed-in');
  const [token, setToken] = useState(() => localStorage.getItem('mageto-token') || '');
  const [email, setEmail] = useState(SIGN_IN_EMAIL);
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('mageto-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (signedIn) localStorage.setItem('mageto-auth', 'signed-in');
    else {
      localStorage.removeItem('mageto-auth');
      localStorage.removeItem('mageto-token');
    }
  }, [signedIn]);

  const authStatus = useMemo(
    () => (signedIn ? `Signed in as ${SIGN_IN_EMAIL}` : 'Client preview access'),
    [signedIn],
  );

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleSignIn(event) {
    event.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('API login failed');
      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('mageto-token', data.token);
      setSignedIn(true);
      setPassword('');
      setAuthMessage('Signed in successfully through the backend API. Preview dashboard unlocked.');
      closeMenu();
      return;
    } catch (_error) {
      if (email.trim().toLowerCase() === SIGN_IN_EMAIL && password === SIGN_IN_PASSWORD) {
        setToken('local-preview-token');
        localStorage.setItem('mageto-token', 'local-preview-token');
        setSignedIn(true);
        setPassword('');
        setAuthMessage('Signed in successfully with local preview fallback.');
        closeMenu();
        return;
      }
    }
    setAuthMessage('Invalid email or password. Use the approved client preview credentials.');
  }

  function handleSignOut() {
    setSignedIn(false);
    setToken('');
    setAuthMessage('Signed out successfully.');
    closeMenu();
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#profile">Skip to content</a>
      <header className="nav">
        <a className="brand" href="#top" aria-label={`${SITE_NAME} home`} onClick={closeMenu}>
          <span>PM</span>
          <strong>{SITE_NAME}</strong>
        </a>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Page sections">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} onClick={closeMenu}>{section.label}</a>
          ))}
          <a href="#access" onClick={closeMenu}>Access</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle light and dark mode">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
          {signedIn ? (
            <button className="nav-cta" type="button" onClick={handleSignOut}>Sign out <FaRightFromBracket /></button>
          ) : (
            <a className="nav-cta" href="#access" onClick={closeMenu}>Sign in <FaRightToBracket /></a>
          )}
          <button className="icon-button menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero" id="profile">
          <div className="hero-copy">
            <span className="eyebrow">Africa University Vice Chancellor</span>
            <h1>Rev. Professor Peter Mageto</h1>
            <p className="lead">
              The fifth Vice Chancellor of Africa University, a theological ethics scholar and
              institutional leader advancing pan-African education through justice, equity,
              collaboration, and student-centered transformation.
            </p>
            <div className="hero-actions">
              <a href="#leadership">Explore leadership <FaArrowRight /></a>
              <a href="#sources">View verified sources</a>
            </div>
            <div className="credibility-note" role="note">
              <strong>Draft status:</strong> content is based on official public sources and should be
              approved by the client or Africa University communications office before final launch.
            </div>
          </div>

          <figure className="portrait-panel">
            <img src={profileImage} alt="Rev. Prof. Peter Mageto" />
            <figcaption>
              <strong>Leadership anchored in people and values.</strong>
              <span>Photo credit: Mike DuBose, UM News. Replace with a client-approved local image before final public launch.</span>
            </figcaption>
          </figure>
        </section>

        <section className="stat-band" aria-label="Leadership highlights">
          {highlights.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
        </section>

        <section className="split-section">
          <div><span className="eyebrow">Executive Summary</span><h2>A servant leader for a continental university mission.</h2></div>
          <div className="rich-text">
            <p>Prof. Mageto brings experience across Kenya, Rwanda, Zimbabwe, and the United States, with a public leadership narrative shaped by theological formation, academic ethics, student welfare, institutional partnerships, and practical transformation.</p>
            <p>This portfolio is designed as a professional executive presence: clear biography, verified leadership timeline, strategic priorities, research identity, and contact pathways that respect his role and institutional dignity.</p>
          </div>
        </section>

        <section className="card-grid" id="leadership">
          <IconCard icon={FaUserTie} title="Institutional Leadership">Guides Africa University as a student-centered, values-grounded, pan-African institution with a focus on relevance and impact.</IconCard>
          <IconCard icon={FaScaleBalanced} title="Ethics and Justice">His scholarship and leadership emphasize ethics, justice, equity, counsel, and community service.</IconCard>
          <IconCard icon={FaHandshake} title="Partnerships">Advocates collaborations, networks, and partnerships as pillars for societal transformation.</IconCard>
        </section>

        <section className="focus-section" id="impact">
          <div className="section-head"><span className="eyebrow">Leadership Focus</span><h2>Clear priorities for institutional confidence.</h2></div>
          <div className="focus-grid">
            {leadershipFocus.map((item, index) => <article key={item.title}><strong>{String(index + 1).padStart(2, '0')}</strong><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </section>

        <section className="timeline-section">
          <div className="section-head"><span className="eyebrow">Career Path</span><h2>Leadership across higher education and ministry.</h2></div>
          <div className="timeline">
            {career.map((item) => <article key={item.role + item.place}><span /><div><strong>{item.role}</strong><em>{item.place}</em><p>{item.note}</p></div></article>)}
          </div>
        </section>

        <section className="credentials" id="scholarship">
          <div className="section-head"><span className="eyebrow">Academic Foundation</span><h2>Scholarship formed by theology, ethics, and African studies.</h2></div>
          <div className="credential-grid">{credentials.map((item) => <article key={item}><FaGraduationCap /><p>{item}</p></article>)}</div>
        </section>

        <section className="two-column">
          <article><FaBookOpen /><h2>Research Themes</h2><div className="pill-row">{researchThemes.map((theme) => <span key={theme}>{theme}</span>)}</div></article>
          <article><FaBuildingColumns /><h2>Selected Publications</h2><ul>{publications.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </section>

        <section className="strategy" id="strategy">
          <div className="strategy-copy"><span className="eyebrow">Strategic Plan 2023-2027</span><h2>Student-centered leadership transformation in Africa.</h2><p>Africa University's strategic direction under Prof. Mageto focuses on student access, empowered staff, financial stewardship, partnerships, and internationalized research and learning.</p></div>
          <div className="strategy-list">{strategyGoals.map((goal, index) => <article key={goal}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{goal}</span></article>)}</div>
        </section>

        <section className="stakeholder-section">
          <div><span className="eyebrow">Audience Design</span><h2>Built for the people who need credible information quickly.</h2></div>
          <div className="stakeholder-list">{stakeholderPaths.map((path) => <article key={path}><FaArrowRight /><span>{path}</span></article>)}</div>
        </section>

        <section className="quote-band"><FaQuoteLeft /><blockquote>"My vision and plan is to see that Africa University keeps its identity as pan-African and trains people for the continent of Africa."</blockquote><span>Prof. Peter Mageto, quoted by UM News</span></section>

        <section className="roadmap-section" id="roadmap">
          <div className="section-head"><span className="eyebrow">Future Improvements</span><h2>A professional roadmap after this first launch.</h2></div>
          <div className="roadmap-list">{roadmap.map((item, index) => <article key={item}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{item}</span></article>)}</div>
        </section>

        <section className="access-section" id="access">
          <div><span className="eyebrow">Secure Preview</span><h2>Client access and review dashboard.</h2><p>{authStatus}</p></div>
          <div className="access-panel">
            {signedIn ? <div className="dashboard-preview">{dashboardItems.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}<button type="button" onClick={handleSignOut}>Sign out</button></div> : <form onSubmit={handleSignIn} data-auth-form="true"><label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" /></label><label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Enter password" /></label><button type="submit" className="access-submit">Sign in <FaRightToBracket /></button></form>}
            {authMessage && <p className="auth-message">{authMessage}</p>}
            <small>This is a static preview login for client review only. The included `schema.sql` documents the future Neon-backed production upgrade.</small>
          </div>
        </section>

        <AdminDashboard signedIn={signedIn} token={token} />

        <section className="contact-section" id="contact">
          <div><span className="eyebrow">Institutional Contact</span><h2>Connect through Africa University.</h2><p>For official communication, use Africa University's public contact channels unless the client provides a direct office address or dedicated media contact.</p><div className="contact-cards"><a href="mailto:info@africau.edu"><FaEnvelope /> info@africau.edu</a><a href="tel:+26324764296"><FaPhone /> +263 24 764296</a><a href="https://africau.edu" target="_blank" rel="noreferrer"><FaGlobe /> africau.edu</a><span><FaLocationDot /> AU, 1 Fairview Rd, Old Mutare, Zimbabwe</span></div></div>
          <ContactForm signedIn={signedIn} token={token} />
        </section>

        <section className="launch-readiness"><div><span className="eyebrow">Launch Readiness</span><h2>What remains before public client release.</h2></div><ul><li>Client-approved portrait and biography.</li><li>Confirmed office contact pathway and media inquiry address.</li><li>Approved speech, award, and publication list.</li><li>Custom domain and final communications approval.</li></ul></section>

        <section className="sources" id="sources"><div className="section-head"><span className="eyebrow">Source-backed Content</span><h2>References used for this draft.</h2></div><div className="source-list">{sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><FaLandmark /><span>{source.label}</span><FaArrowRight /></a>)}</div></section>
      </main>

      <footer><strong>{SITE_NAME}</strong><span>Africa University | Old Mutare, Zimbabwe | Built for review, approval, and launch.</span></footer>
    </div>
  );
}

export default App;
