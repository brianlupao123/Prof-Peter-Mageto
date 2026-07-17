export default function Logo({ size = 40, showWordmark = true, logoUrl }) {
  if (logoUrl) {
    return (
      <span className="site-logo">
        <img src={logoUrl} alt="Peter Mageto Portfolio logo" style={{ height: size, width: 'auto' }} />
        {showWordmark && <strong>The Mageto Portfolio</strong>}
      </span>
    );
  }

  // Custom SVG: academic shield + African continent silhouette + "PM" monogram
  return (
    <span className="site-logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="Peter Mageto Portfolio — Africa University"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield body */}
        <path
          d="M24 2 L43 8.5 V21 C43 34.5 35 43 24 46.5 C13 43 5 34.5 5 21 V8.5 Z"
          fill="var(--brand-strong)"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        {/* Africa continent silhouette (simplified) */}
        <path
          d="M19 11 C17 11 16 13 16 15 L16 18 C16 20 17 22 19 23 L20 26 C20 28 21 30 22 31 C22.5 32 23 34 22.5 35 C22 36 22.5 37 23.5 37 C25 37 25.5 36 25 35 C24.5 34 25 32 26 31 C27 30 28 28 28 26 L29 23 C31 22 32 20 32 18 L32 15 C32 13 31 11 29 11 Z"
          fill="rgba(255,255,255,0.22)"
        />
        {/* PM Monogram */}
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontFamily="Inter, Georgia, sans-serif"
          fontWeight="900"
          fontSize="15"
          fill="#fff"
          letterSpacing="-0.5"
        >
          PM
        </text>
        {/* Decorative arc — academic cap brim */}
        <path
          d="M15 36 Q24 41 33 36"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Top star accent */}
        <circle cx="24" cy="6" r="1.5" fill="var(--accent)" />
      </svg>
      {showWordmark && <strong>The Mageto Portfolio</strong>}
    </span>
  );
}
