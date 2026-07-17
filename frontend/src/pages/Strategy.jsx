import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Strategy() {
  const slides = useHeroSlides('strategy');
  const { data } = useProfile();
  const strategyGoals = data?.strategyGoals ?? [];
  return <><PageBanner pageKey="strategy" slides={slides} /><section className="strategy page-section"><div className="strategy-copy"><span className="eyebrow">Strategic Plan 2023-2027</span><h2>Student-centered leadership transformation in Africa.</h2><p>Africa University's strategic direction under Prof. Mageto focuses on student access, empowered staff, financial stewardship, partnerships, and internationalized research and learning.</p></div><div className="strategy-list">{strategyGoals.map((goal, index) => <article key={goal.id || goal.label}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{goal.label}</span></article>)}</div></section></>;
}
