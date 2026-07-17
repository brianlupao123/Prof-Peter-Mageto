import { Link } from 'react-router-dom';
import { FaArrowRight, FaHandshake, FaScaleBalanced, FaUserTie } from 'react-icons/fa6';
import IconCard from '../components/IconCard.jsx';
import PageBanner from '../components/PageBanner.jsx';
import { highlights, leadershipFocus, SITE_NAME, stakeholderPaths } from '../data/profileData.js';
import { useHeroSlides } from '../lib/useProfile.js';

export default function Home() {
  const slides = useHeroSlides('overview');
  return (
    <>
      <PageBanner pageKey="overview" slides={slides} level="h1" ctas={<><Link to="/leadership">Explore leadership <FaArrowRight /></Link><Link to="/sources">View verified sources</Link></>} />
      <section className="stat-band">{highlights.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</section>
      <section className="card-grid page-section"><IconCard icon={FaUserTie} title="Institutional Leadership">Guides Africa University as a student-centered, values-grounded, pan-African institution.</IconCard><IconCard icon={FaScaleBalanced} title="Ethics and Justice">Connects scholarship and governance to ethics, justice, equity, counsel, and service.</IconCard><IconCard icon={FaHandshake} title="Partnerships">Frames collaboration and networks as instruments for societal transformation.</IconCard></section>
      <section className="stakeholder-section page-section"><div><span className="eyebrow">Audience Design</span><h2>Built for credible information, fast.</h2></div><div className="stakeholder-list">{stakeholderPaths.map((path) => <article key={path}><FaArrowRight /><span>{path}</span></article>)}</div></section>
      <section className="focus-grid page-section">{leadershipFocus.map((item, index) => <article key={item.title}><strong>{String(index + 1).padStart(2, '0')}</strong><h3>{item.title}</h3><p>{item.text}</p></article>)}</section>
    </>
  );
}
