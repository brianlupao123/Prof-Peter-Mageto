import { useEffect } from 'react';
import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { strategyGoals as staticStrategyGoals } from '../data/profileData.js';

export default function Strategy() {
  const slides = useHeroSlides('strategy');
  const { data } = useProfile();
  const strategyGoals = data?.strategyGoals?.length ? data.strategyGoals : staticStrategyGoals.map((g, i) => ({ id: `sg-${i}`, label: g }));

  useEffect(() => {
    document.title = 'Strategy 2023–2027 | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="strategy" slides={slides} profile={data?.profile} />

      <section className="strategy page-section">
        <div className="strategy-copy">
          <span className="eyebrow">Strategic Plan 2023–2027</span>
          <h2>Student-centered leadership transformation in Africa.</h2>
          <p className="lead">
            Africa University's strategic direction under Prof. Mageto focuses on five interlocking priorities:
            student access and success, empowered staff, financial stewardship, strategic partnerships,
            and internationalized research, teaching, and learning.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.75rem' }}>
            Launched February 2023 — <a href="https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>View official announcement ↗</a>
          </p>
        </div>

        <div className="strategy-list">
          {strategyGoals.map((goal, index) => (
            <article key={goal.id || goal.label}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <span>{goal.label}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Summary note */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <div className="notice-panel">
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text)' }}>Implementation note:</strong> The five strategic priorities were
            identified collaboratively with Africa University's Board, Senate, and key stakeholders and formally
            launched by Prof. Mageto in February 2023.
          </p>
        </div>
      </section>
    </>
  );
}
