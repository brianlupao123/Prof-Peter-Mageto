import { strategyGoals } from '../data/profileData.js';

export default function Strategy() {
  return <><section className="strategy page-section"><div className="strategy-copy"><span className="eyebrow">Strategic Plan 2023-2027</span><h1>Student-centered leadership transformation in Africa.</h1><p>Africa University's strategic direction under Prof. Mageto focuses on student access, empowered staff, financial stewardship, partnerships, and internationalized research and learning.</p></div><div className="strategy-list">{strategyGoals.map((goal, index) => <article key={goal}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{goal}</span></article>)}</div></section></>;
}
