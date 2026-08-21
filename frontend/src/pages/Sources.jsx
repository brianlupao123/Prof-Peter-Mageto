import { useEffect } from 'react';
import { FaArrowUpRightFromSquare, FaCircleCheck } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { sources as staticSources } from '../data/profileData.js';

const sourceTypeLabels = {
  official: 'Official',
  press: 'Press',
  contextual: 'Contextual',
  scholarly: 'Scholarly',
};

function formatSourceType(value) {
  if (!value) return null;
  return sourceTypeLabels[value] || value.replace(/[_-]/g, ' ');
}

function formatPublishedDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function Sources() {
  const slides = useHeroSlides('sources');
  const { data } = useProfile();
  const rawSources = data?.sources?.length ? data.sources : staticSources.map((s, i) => ({ id: `src-${i}`, ...s }));
  const sources = rawSources
    .filter((source) => source.retired !== true)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

  useEffect(() => {
    document.title = 'Sources | Rev. Prof. Peter Mageto - Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="sources" slides={slides} profile={data?.profile} />
      <EngagementSection pageKey="sources" contactHref="/contact?request=media#contact-form" />

      <section className="page-section">
        <span className="eyebrow">Verification</span>
        <h2>Sources and launch evidence.</h2>
        <p className="lead">
          A public leadership profile should be built from official, reviewable references. Every claim on this site
          is traceable to the primary source below.
        </p>

        <div className="source-list" style={{ marginTop: '1.5rem' }}>
          {sources.map((source) => {
            const sourceType = formatSourceType(source.source_type);
            const publishedDate = formatPublishedDate(source.published_date);
            const attribution = [source.publisher, publishedDate].filter(Boolean).join(' | ');

            return (
              <a
                key={source.id || source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-list-item"
              >
                <div className="source-list-main">
                  {source.verified ? <FaCircleCheck className="source-verified-icon" aria-hidden="true" /> : null}
                  <div className="source-list-copy">
                    <div className="source-meta-row">
                      {sourceType ? <span className="source-type-label">{sourceType}</span> : null}
                      {source.verified ? <span className="source-verified-label">Verified</span> : null}
                    </div>
                    <strong>{source.label}</strong>
                    {attribution ? <span className="source-attribution">{attribution}</span> : null}
                  </div>
                </div>
                <FaArrowUpRightFromSquare className="source-link-icon" aria-hidden="true" />
              </a>
            );
          })}
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
