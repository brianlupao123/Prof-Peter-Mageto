import { FaBookOpen, FaBuildingColumns, FaGraduationCap } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Scholarship() {
  const slides = useHeroSlides('scholarship');
  const { data } = useProfile();
  const credentials = data?.credentials ?? [];
  const publications = data?.publications ?? [];
  const researchThemes = data?.researchThemes ?? [];
  return <><PageBanner pageKey="scholarship" slides={slides} /><section className="credential-grid page-section">{credentials.map((item) => <article key={item.id || item.label}><FaGraduationCap /><p>{item.label}</p></article>)}</section><section className="two-column page-section"><article><FaBookOpen /><h2>Research Themes</h2><div className="pill-row">{researchThemes.map((theme) => <span key={theme.id || theme.label}>{theme.label}</span>)}</div></article><article><FaBuildingColumns /><h2>Selected Publications</h2><ul>{publications.map((item) => <li key={item.id || item.title}>{item.title}</li>)}</ul></article></section></>;
}
