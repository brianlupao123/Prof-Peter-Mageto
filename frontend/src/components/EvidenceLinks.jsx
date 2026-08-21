import { Link } from 'react-router-dom';
import { FaArrowRight, FaArrowUpRightFromSquare, FaCircleCheck } from 'react-icons/fa6';

export default function EvidenceLinks({ title = 'Evidence trail', note, links = [] }) {
  return (
    <div className="evidence-links-panel">
      <div className="evidence-links-head">
        <span>
          <FaCircleCheck aria-hidden="true" />
          Verified evidence
        </span>
        <Link to="/sources">
          Full source register <FaArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div>
        <strong>{title}</strong>
        {note ? <p>{note}</p> : null}
      </div>
      {links.length > 0 ? (
        <div className="evidence-links-list">
          {links.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
              <span>{item.label}</span>
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
