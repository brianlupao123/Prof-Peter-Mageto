import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaHandshake, FaScaleBalanced, FaUserTie } from 'react-icons/fa6';
import IconCard from '../components/IconCard.jsx';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { highlights, leadershipFocus, SITE_NAME, stakeholderPaths } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Home() {
  const slides = useHeroSlides('overview');
  const { data } = useProfile();

  useEffect(() => {
    document.title = 'Overview | Rev. Prof. Peter Mageto — Africa University Vice Chancellor';
  }, []);

  return (
    <>
      <PageBanner
        pageKey="overview"
        slides={slides}
        profile={data?.profile}
        level="h1"
      />
      <LikeButton pageKey="overview" />

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
        <p className="credibility-note">
          All claims on this site are drawn from Africa University's official website, UM News, and public announcements.
          Every page links to its primary source. <Link to="/sources" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>View all sources ?</Link>
        </p>
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

