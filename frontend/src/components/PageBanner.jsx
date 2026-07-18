import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

/**
 * PageBanner — sliding hero carousel.
 *
 * Props:
 *   pageKey   — string, used for CSS scoping and aria-label
 *   slides    — array of slide objects from useHeroSlides()
 *   profile   — profile object from useProfile() for the identity card
 *   level     — heading level ('h1' on home, 'h2' elsewhere)
 *   ctas      — optional JSX rendered on every slide (page-level CTAs)
 *
 * Per-slide CTAs: if a slide has `cta_label` + `cta_href` those are
 * rendered as a button on that slide only (used on the Home carousel so
 * each slide can link to its own page).
 */
export default function PageBanner({ pageKey, slides, profile, level = 'h2', ctas }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reset to first slide whenever the page changes
  useEffect(() => { setIndex(0); }, [pageKey]);

  // Auto-advance only when there are multiple slides
  useEffect(() => {
    if (!slides || slides.length < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [slides, paused]);

  if (!slides || slides.length === 0) {
    return <div className="skeleton-banner" aria-hidden="true" />;
  }

  const Heading = level;
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className={`page-banner page-banner--${pageKey}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={`${pageKey} hero banner`}
    >
      {/* ── Sliding track ── */}
      <div
        className="page-banner-track"
        style={{ transform: `translateX(-${index * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((slide, slideIdx) => {
          const hasImage = Boolean(slide.background_image_url);
          // Per-slide CTA takes priority; fall back to page-level ctas
          const slideActions = slide.cta_label && slide.cta_href
            ? (
              <div className="hero-actions">
                <Link to={slide.cta_href} className="cta-primary">
                  {slide.cta_label} <FaArrowRight />
                </Link>
              </div>
            )
            : ctas
              ? <div className="hero-actions">{ctas}</div>
              : null;

          return (
            <div
              key={slide.id}
              className={`page-banner-slide ${hasImage ? 'has-image' : 'no-image'}`}
              style={{ width: `${100 / slides.length}%`, flexShrink: 0 }}
            >
              {hasImage && (
                <img
                  className="page-banner-bg"
                  src={slide.background_image_url}
                  alt=""
                  aria-hidden="true"
                  loading={slideIdx === 0 ? 'eager' : 'lazy'}
                  fetchpriority={slideIdx === 0 ? 'high' : 'low'}
                />
              )}
              <div className="page-banner-overlay" />

              {/* Copy panel */}
              <div className="page-banner-copy">
                {slide.eyebrow && <span className="eyebrow">{slide.eyebrow}</span>}
                <Heading>{slide.heading}</Heading>
                {slide.subheading && <p className="lead">{slide.subheading}</p>}
                {slide.body && <p>{slide.body}</p>}
                {slideActions}
              </div>

              {/* Identity card */}
              <aside className="page-banner-card">
                {profile?.portrait_url
                  ? <img className="avatar-photo" src={profile.portrait_url} alt={profile.full_name || 'Portrait'} />
                  : <span className="avatar">{(profile?.full_name || 'PM').split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
                }
                <strong>{profile?.full_name || 'Rev. Prof. Peter Mageto'}</strong>
                <span>{profile?.title || 'Fifth Vice Chancellor | Africa University'}</span>
                {slide.panel_caption && <p>{slide.panel_caption}</p>}
              </aside>
            </div>
          );
        })}
      </div>

      {/* ── Prev / Next arrows (only when multiple slides) ── */}
      {slides.length > 1 && (
        <>
          <button type="button" className="banner-arrow banner-arrow--prev" aria-label="Previous slide" onClick={prev}>
            <FaChevronLeft />
          </button>
          <button type="button" className="banner-arrow banner-arrow--next" aria-label="Next slide" onClick={next}>
            <FaChevronRight />
          </button>
          <div className="page-banner-dots" role="tablist" aria-label="Banner slides">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show slide ${i + 1}`}
                className={i === index ? 'active' : ''}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
