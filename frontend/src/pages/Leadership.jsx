import { FaQuoteLeft } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import { leadershipFocus } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Leadership() {
  const slides = useHeroSlides('leadership');
  const { data } = useProfile();
  const career = data?.careerEntries ?? [];
  return <><PageBanner pageKey="leadership" slides={slides} /><section className="focus-grid page-section">{leadershipFocus.map((item, index) => <article key={item.title}><strong>{String(index + 1).padStart(2, '0')}</strong><h3>{item.title}</h3><p>{item.text}</p></article>)}</section><section className="timeline-section page-section"><div className="section-head"><span className="eyebrow">Career Path</span><h2>Leadership timeline.</h2></div><div className="timeline">{career.map((item) => <article key={item.id || item.role + item.place}><span /><div><strong>{item.role}</strong><em>{item.place}</em><p>{item.note}</p></div></article>)}</div></section><section className="quote-band page-section"><FaQuoteLeft /><blockquote>My vision and plan is to see that Africa University keeps its identity as pan-African and trains people for the continent of Africa.</blockquote><span>Prof. Peter Mageto, quoted by UM News</span></section></>;
}
