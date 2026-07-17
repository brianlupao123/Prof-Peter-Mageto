export default function Logo({ size = 40, showWordmark = true, logoUrl }) {
  if (logoUrl) {
    return <span className="site-logo"><img src={logoUrl} alt="Peter Mageto Portfolio logo" style={{ height: size, width: 'auto' }} />{showWordmark && <strong>The Mageto Portfolio</strong>}</span>;
  }
  return (
    <span className="site-logo">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Peter Mageto Portfolio logo">
        <path d="M24 2 L44 9 V22 C44 34 36 43 24 46 C12 43 4 34 4 22 V9 Z" fill="var(--brand-strong)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="24" y="29" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" fill="#fff">PM</text>
        <path d="M14 34 Q24 40 34 34" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
      </svg>
      {showWordmark && <strong>The Mageto Portfolio</strong>}
    </span>
  );
}
