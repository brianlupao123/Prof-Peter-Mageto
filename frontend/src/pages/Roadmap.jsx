import { roadmap } from '../data/profileData.js';

export default function Roadmap() {
  return <><section className="page-hero"><span className="eyebrow">Future Improvements</span><h1>Roadmap from launch draft to official digital office.</h1><p>The platform is already full-stack. The next phase is official content approval, persistent database setup, and office workflow integration.</p></section><section className="roadmap-list page-section">{roadmap.map((item, index) => <article key={item}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{item}</span></article>)}</section></>;
}
