import { useEffect } from 'react';
import EvidenceLinks from '../components/EvidenceLinks.jsx';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { roadmap } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Roadmap() {
  const slides = useHeroSlides('roadmap');
  const { data } = useProfile();

  useEffect(() => {
    document.title = 'Platform Roadmap | Rev. Prof. Peter Mageto Portfolio';
  }, []);

  return (
    <>
      <PageBanner pageKey="roadmap" slides={slides} profile={data?.profile} />
      <EngagementSection pageKey="roadmap" contactHref="/contact?request=meeting#contact-form" />
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

      <section className="page-section" style={{ paddingTop: 0 }}>
        <EvidenceLinks
          title="Platform transparency."
          note="The roadmap sits beside the public source register so visitors can separate verified biography, strategy evidence, and platform features."
          links={[
            {
              label: 'Africa University official contact page',
              href: 'https://africau.edu/about/contact-us/',
            },
            {
              label: 'Africa University Vice Chancellor profile',
              href: 'https://africau.edu/about/vice-chancellor/',
            },
          ]}
        />
      </section>
    </>
  );
}


