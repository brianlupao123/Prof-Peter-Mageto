import { useEffect } from 'react';
import { FaQuoteLeft } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { leadershipFocus } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Leadership() {
  const slides = useHeroSlides('leadership');
  const { data } = useProfile();
  const career = data?.careerEntries ?? [];

  useEffect(() => {
    document.title = 'Leadership | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="leadership" slides={slides} profile={data?.profile} />
      <EngagementSection pageKey="leadership" />

      {/* Leadership philosophy grid */}
      <section className="focus-grid page-section">
        {leadershipFocus.map((item, index) => (
          <article key={item.title}>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <h2 style={{ fontSize: 'inherit' }}>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      {/* Career timeline */}
      <section className="timeline-section page-section">
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="eyebrow">Career Path</span>
          <h2>Leadership timeline.</h2>
          <p className="lead">From pastoral ministry and academia to institutional leadership, Prof. Mageto's journey spans Kenya, Rwanda, the United States, and Zimbabwe.</p>
        </div>
        <div className="timeline">
          {career.length === 0 && (
            <>
              {[{
                role: 'Vice Chancellor', place: 'Africa University, Zimbabwe',
                note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.',
              }, {
                role: 'Deputy Vice Chancellor & Interim Vice Chancellor', place: 'Africa University',
                note: 'Served in senior academic leadership before installation as Vice Chancellor.',
              }, {
                role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda',
                note: 'Advanced institutional leadership, academic quality, and ethical scholarship.',
              }, {
                role: 'Academic Leader & Ethics Scholar', place: 'Kenya Methodist University, Daystar University, University of Evansville',
                note: 'Held roles across academic affairs, student welfare, and ethics teaching.',
              }].map((item) => (
                <article key={item.role}>
                  <span />
                  <div>
                    <strong>{item.role}</strong>
                    <em>{item.place}</em>
                    <p>{item.note}</p>
                  </div>
                </article>
              ))}
            </>
          )}
          {career.map((item) => (
            <article key={item.id || item.role + item.place}>
              <span />
              <div>
                <strong>{item.role}</strong>
                <em>{item.place}</em>
                {item.note && <p>{item.note}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quote band */}
      <section className="quote-band" style={{ padding: 'clamp(2rem, 5vw, 4rem) max(1rem, calc((100% - 1180px) / 2))' }}>
        <FaQuoteLeft style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
        <blockquote>
          My vision and plan is to see that Africa University keeps its identity as pan-African and trains people for the continent of Africa.
        </blockquote>
        <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>— Prof. Peter Mageto, UM News</span>
      </section>
    </>
  );
}


