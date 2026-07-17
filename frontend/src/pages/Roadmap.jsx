import PageBanner from '../components/PageBanner.jsx';
import { roadmap } from '../data/profileData.js';
import { useHeroSlides } from '../lib/useProfile.js';

export default function Roadmap() {
  const slides = useHeroSlides('roadmap');
  return <><PageBanner pageKey="roadmap" slides={slides} /><section className="roadmap-list page-section">{roadmap.map((item, index) => <article key={item}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{item}</span></article>)}</section></>;
}
