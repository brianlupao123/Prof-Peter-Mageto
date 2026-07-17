import { useEffect } from 'react';
import PageBanner from '../components/PageBanner.jsx';
import { roadmap } from '../data/profileData.js';
import { useHeroSlides } from '../lib/useProfile.js';

export default function Roadmap() {
  const slides = useHeroSlides('roadmap');

  useEffect(() => {
    document.title = 'Platform Roadmap | Rev. Prof. Peter Mageto Portfolio';
  }, []);

  return (
    <>
      <PageBanner pageKey="roadmap" slides={slides} />
      <section className="page-section">
        <span className="eyebrow">Platform Roadmap</span>
        <h2>What's built, what's in progress, what's planned.</h2>
        <p className="lead">
          A transparent list of where this portfolio platform stands before public launch.
          Each milestone is tracked in the admin dashboard.
        </p>
        <div className="roadmap-list" style={{ marginTop: '1.5rem' }}>
          {roadmap.map((item, index) => (
            <article key={item}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <span>{item}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
