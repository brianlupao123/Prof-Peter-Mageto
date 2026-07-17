import { FaBookOpen, FaBuildingColumns, FaGraduationCap } from 'react-icons/fa6';
import { credentials, publications, researchThemes } from '../data/profileData.js';

export default function Scholarship() {
  return <><section className="page-hero"><span className="eyebrow">Scholarship</span><h1>Theology, ethics, African studies, and public transformation.</h1><p>A scholarly profile shaped by theological ethics, education, peace, reconciliation, and institutional service.</p></section><section className="credential-grid page-section">{credentials.map((item) => <article key={item}><FaGraduationCap /><p>{item}</p></article>)}</section><section className="two-column page-section"><article><FaBookOpen /><h2>Research Themes</h2><div className="pill-row">{researchThemes.map((theme) => <span key={theme}>{theme}</span>)}</div></article><article><FaBuildingColumns /><h2>Selected Publications</h2><ul>{publications.map((item) => <li key={item}>{item}</li>)}</ul></article></section></>;
}
