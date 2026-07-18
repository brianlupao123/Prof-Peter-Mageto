import { useEffect } from 'react';
import { FaBookOpen, FaBuildingColumns, FaGraduationCap } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { credentials as staticCredentials, publications as staticPublications, researchThemes as staticResearchThemes } from '../data/profileData.js';

export default function Scholarship() {
  const slides = useHeroSlides('scholarship');
  const { data } = useProfile();
  const credentials = data?.credentials?.length ? data.credentials : staticCredentials.map((c, i) => ({ id: `sc-${i}`, label: c }));
  const publications = data?.publications?.length ? data.publications : staticPublications.map((p, i) => ({ id: `sp-${i}`, title: p }));
  const researchThemes = data?.researchThemes?.length ? data.researchThemes : staticResearchThemes.map((t, i) => ({ id: `st-${i}`, label: t }));

  useEffect(() => {
    document.title = 'Scholarship | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="scholarship" slides={slides} profile={data?.profile} />
      <EngagementSection pageKey="scholarship" />

      {/* Credentials grid */}
      <section className="page-section">
        <span className="eyebrow">Academic Credentials</span>
        <h2>Educational foundation.</h2>
        <p className="lead">
          Grounded in theological ethics, African studies, and institutional leadership — credentials earned across
          Kenya, the United States, and Africa.
        </p>
        <div className="credential-grid" style={{ marginTop: '1.5rem' }}>
          {credentials.map((item) => (
            <article key={item.id || item.label}>
              <FaGraduationCap />
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Research themes + Publications */}
      <section className="two-column page-section">
        <article>
          <FaBookOpen />
          <h2>Research Themes</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Prof. Mageto's scholarship spans ethics, theology, and Africa's development challenges.
          </p>
          <div className="pill-row">
            {researchThemes.map((theme) => (
              <span key={theme.id || theme.label}>{theme.label}</span>
            ))}
          </div>
        </article>

        <article>
          <FaBuildingColumns />
          <h2>Selected Publications</h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'grid', gap: '0.6rem' }}>
            {publications.map((item) => (
              <li key={item.id || item.title} style={{ lineHeight: '1.5' }}>{item.title}</li>
            ))}
          </ul>
          <p style={{ color: 'var(--muted)', fontSize: '0.84rem', marginTop: '1rem' }}>
            Publications listed are from publicly verified academic records and institutional biography.
          </p>
        </article>
      </section>
    </>
  );
}


