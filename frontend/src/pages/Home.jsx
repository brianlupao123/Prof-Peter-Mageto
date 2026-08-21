import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaBullhorn,
  FaCalendarCheck,
  FaHandshake,
  FaNewspaper,
  FaScaleBalanced,
  FaShieldHalved,
  FaUserTie,
} from 'react-icons/fa6';
import IconCard from '../components/IconCard.jsx';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { highlights, leadershipFocus, stakeholderPaths } from '../data/profileData.js';
import { apiFetch } from '../lib/api.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

const messageTypeLabels = {
  message: 'Message',
  speech: 'Speech',
  statement: 'Statement',
  address: 'Address',
};

function formatMessageType(value) {
  return messageTypeLabels[value] || String(value || 'Message').replace(/[_-]/g, ' ');
}

function formatMessageDate(value) {
  if (!value) return 'Undated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Undated';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function messageExcerpt(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 128) return text;
  return text.slice(0, 128).trim() + '...';
}

export default function Home() {
  const slides = useHeroSlides('overview');
  const { data } = useProfile();
  const [officeMessages, setOfficeMessages] = useState([]);
  const [officeMessagesStatus, setOfficeMessagesStatus] = useState('loading');

  useEffect(() => {
    document.title = 'Overview | Rev. Prof. Peter Mageto — Africa University Vice Chancellor';
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch('/api/office-messages')
      .then((payload) => {
        if (!active) return;
        setOfficeMessages(payload.officeMessages || []);
        setOfficeMessagesStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setOfficeMessagesStatus('error');
      });

    return () => { active = false; };
  }, []);

  const featuredMessages = useMemo(() => [...officeMessages]
    .sort((a, b) => {
      const dateCompare = String(b.publishedDate || '').localeCompare(String(a.publishedDate || ''));
      if (dateCompare !== 0) return dateCompare;
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    })
    .slice(0, 2), [officeMessages]);

  return (
    <>
      <PageBanner
        pageKey="overview"
        slides={slides}
        profile={data?.profile}
        level="h1"
      />
      <EngagementSection pageKey="overview" />

      <section className="office-pathways page-section">
        <div className="section-kicker-row">
          <div>
            <span className="eyebrow">Public Office Workflow</span>
            <h2>More than a profile page.</h2>
          </div>
          <Link to="/contact#contact-form" className="section-inline-action">
            Start request <FaArrowRight />
          </Link>
        </div>
        <div className="office-pathway-grid">
          <Link to="/contact?request=meeting#contact-form" className="office-pathway-card">
            <FaCalendarCheck />
            <strong>Request meeting</strong>
            <span>Structured appointment enquiries routed to the admin inbox.</span>
          </Link>
          <Link to="/contact?request=speaking#contact-form" className="office-pathway-card">
            <FaBullhorn />
            <strong>Invite to speak</strong>
            <span>Speaking invitations separated from general messages for faster review.</span>
          </Link>
          <Link to="/contact?request=media#contact-form" className="office-pathway-card">
            <FaNewspaper />
            <strong>Media enquiry</strong>
            <span>Press and biography checks directed through verified institutional context.</span>
          </Link>
          <Link to="/sources" className="office-pathway-card">
            <FaShieldHalved />
            <strong>Verify claims</strong>
            <span>Public source trail for leadership, strategy, scholarship, and contact data.</span>
          </Link>
        </div>
      </section>

      <section className="office-message-preview page-section">
        <div className="section-kicker-row">
          <div>
            <span className="eyebrow">Messages & Speeches</span>
            <h2>Public voice of the Vice Chancellor's office.</h2>
          </div>
          <Link to="/messages" className="section-inline-action">
            Open archive <FaArrowRight />
          </Link>
        </div>

        {officeMessagesStatus === 'ready' && featuredMessages.length > 0 ? (
          <div className="office-message-preview-grid">
            {featuredMessages.map((item) => (
              <article key={item.id} className="office-message-preview-card">
                <div className="source-meta-row">
                  <span className="source-type-label">{formatMessageType(item.type)}</span>
                  <span className="source-attribution">{formatMessageDate(item.publishedDate)}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{messageExcerpt(item.body)}</p>
                <Link to="/messages" className="message-source-link">
                  Read in archive <FaArrowRight />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="office-message-empty">
            <FaBullhorn />
            <div>
              <strong>{officeMessagesStatus === 'error' ? 'Archive temporarily unavailable' : 'Formal archive ready'}</strong>
              <span>
                {officeMessagesStatus === 'error'
                  ? 'Public pages remain available while messages are refreshed.'
                  : 'Published speeches, statements, and addresses appear here once released by the office.'}
              </span>
            </div>
            <Link to="/messages">
              Visit archive <FaArrowUpRightFromSquare />
            </Link>
          </div>
        )}
      </section>

      {/* Stats band */}
      <section className="stat-band">
        {highlights.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      {/* Core values cards */}
      <section className="card-grid page-section">
        <IconCard icon={FaUserTie} title="Institutional Leadership">
          Guides Africa University as a student-centered, values-grounded, pan-African institution advancing justice and equity.
        </IconCard>
        <IconCard icon={FaScaleBalanced} title="Ethics and Justice">
          Connects scholarship and governance to ethics, justice, equity, counsel, and service across the continent.
        </IconCard>
        <IconCard icon={FaHandshake} title="Partnerships">
          Frames collaboration and global networks as instruments for societal transformation and shared growth.
        </IconCard>
      </section>

      {/* Credibility note */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <div className="evidence-ribbon">
          <span>Verified profile</span>
          <span>Official contact route</span>
          <span>Source metadata</span>
          <span>Admin-managed content</span>
          <Link to="/sources">View all sources <FaArrowRight /></Link>
        </div>
      </section>

      {/* Stakeholder paths */}
      <section className="stakeholder-section page-section">
        <div>
          <span className="eyebrow">Audience Design</span>
          <h2>Built for credible information, fast.</h2>
          <p className="lead">This portfolio serves funders, partners, academic peers, students, and media — each with a direct path to what matters most to them.</p>
        </div>
        <div className="stakeholder-list">
          {stakeholderPaths.map((path) => (
            <article key={path}>
              <FaArrowRight />
              <span>{path}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Leadership focus grid */}
      <section className="focus-grid page-section">
        {leadershipFocus.map((item, index) => (
          <article key={item.title}>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}


