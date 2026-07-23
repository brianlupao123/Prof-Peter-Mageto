import { useEffect } from 'react';
import { FaArrowUpRightFromSquare, FaCircleCheck } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { sources as staticSources } from '../data/profileData.js';

export default function Sources() {
  const slides = useHeroSlides('sources');
  const { data } = useProfile();
  const sources = (data?.sources?.length ? data.sources : staticSources.map((s, i) => ({ id: `src-${i}`, ...s })))
    .filter((source) => source.retired !== true);

  useEffect(() => {
    document.title = 'Sources | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="sources" slides={slides} profile={data?.profile} />
      <EngagementSection pageKey="sources" />

      <section className="page-section">
        <span className="eyebrow">Verification</span>
        <h2>Sources and launch evidence.</h2>
        <p className="lead">
          A public leadership profile should be built from official, reviewable references. Every claim on this site
          is traceable to the primary source below.
        </p>

        <div className="source-list" style={{ marginTop: '1.5rem' }}>
          {sources.map((source) => (
            <a
              key={source.id || source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-list-item"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <FaCircleCheck style={{ color: 'var(--brand-strong)', flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.15rem' }}>{source.label}</strong>
                  <span className="badge-verified">{source.verified ? 'Verified public record' : 'Contextual public reference'}</span>
                </div>
              </div>
              <FaArrowUpRightFromSquare style={{ color: 'var(--muted)', flexShrink: 0 }} />
            </a>
          ))}
        </div>

        <div className="notice-panel" style={{ marginTop: '2rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Note on accuracy:</strong> All factual claims are drawn exclusively
            from Africa University's official website, UM News, and public institutional announcements.
            No inference, speculation, or secondary sources are used.
          </p>
        </div>
      </section>
    </>
  );
}


