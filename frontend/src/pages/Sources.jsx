import { FaExternalLinkAlt } from 'react-icons/fa';
import { sources } from '../data/profileData.js';

export default function Sources() {
  return (
    <section className="page-section">
      <span className="eyebrow">Verification</span>
      <h1>Sources and launch evidence.</h1>
      <p className="lead">A public leadership profile should be built from official, reviewable references. These links guide the biography, institutional role, and strategic priorities.</p>
      <div className="source-list">
        {sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            <span>{source.label}</span>
            <FaExternalLinkAlt />
          </a>
        ))}
      </div>
    </section>
  );
}
