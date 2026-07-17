import { FaArrowRight, FaHandshake, FaScaleBalanced, FaUserTie } from 'react-icons/fa6';
import IconCard from '../components/IconCard.jsx';
import PortraitPanel from '../components/PortraitPanel.jsx';
import { highlights, leadershipFocus, SITE_NAME, stakeholderPaths } from '../data/profileData.js';

export default function Home() {
  return (
    <>
      <section className="hero page-band">
        <div className="hero-copy">
          <span className="eyebrow">Africa University Vice Chancellor</span>
          <h1>Rev. Professor Peter Mageto</h1>
          <p className="lead">The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.</p>
          <div className="hero-actions"><a href="/leadership">Explore leadership <FaArrowRight /></a><a href="/sources">View verified sources</a></div>
          <div className="credibility-note"><strong>{SITE_NAME}</strong> is a full-stack leadership platform with a backend API, admin dashboard, contact workflow, and future-ready Neon persistence.</div>
        </div>
        <PortraitPanel />
      </section>
      <section className="stat-band">{highlights.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</section>
      <section className="card-grid page-section">
        <IconCard icon={FaUserTie} title="Institutional Leadership">Guides Africa University as a student-centered, values-grounded, pan-African institution.</IconCard>
        <IconCard icon={FaScaleBalanced} title="Ethics and Justice">Connects scholarship and governance to ethics, justice, equity, counsel, and service.</IconCard>
        <IconCard icon={FaHandshake} title="Partnerships">Frames collaboration and networks as instruments for societal transformation.</IconCard>
      </section>
      <section className="stakeholder-section page-section"><div><span className="eyebrow">Audience Design</span><h2>Built for credible information, fast.</h2></div><div className="stakeholder-list">{stakeholderPaths.map((path) => <article key={path}><FaArrowRight /><span>{path}</span></article>)}</div></section>
      <section className="focus-grid page-section">{leadershipFocus.map((item, index) => <article key={item.title}><strong>{String(index + 1).padStart(2, '0')}</strong><h3>{item.title}</h3><p>{item.text}</p></article>)}</section>
    </>
  );
}
