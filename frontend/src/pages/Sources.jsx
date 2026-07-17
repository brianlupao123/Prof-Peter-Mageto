import { FaExternalLinkAlt } from 'react-icons/fa';
import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Sources() {
  const slides = useHeroSlides('sources');
  const { data } = useProfile();
  const sources = data?.sources ?? [];
  return <><PageBanner pageKey="sources" slides={slides} /><section className="page-section"><span className="eyebrow">Verification</span><h2>Sources and launch evidence.</h2><p className="lead">A public leadership profile should be built from official, reviewable references.</p><div className="source-list">{sources.map((source) => <a key={source.id || source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.label}</span><FaExternalLinkAlt /></a>)}</div></section></>;
}
