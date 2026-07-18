import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const SLIDE_IMAGE_FALLBACKS = {
  overview: [
    'https://www.umnews.org/-/media/umc-media/2022/10/20/20/45/au-mageto-profile-1-horizontal-1200x800.jpg',
    'https://africau.edu/wp-content/uploads/2023/12/profmageto-1.png',
    'https://africau.edu/wp-content/themes/africau/images/profmageto.png',
    'https://aunews.africau.edu/wp-content/uploads/2023/11/STRATEGIC-PLAN-MEETING-34-800x445.jpg',
    'https://africau.edu/wp-content/themes/africau/images/sunset.jpg',
    'https://aunews.africau.edu/wp-content/uploads/2026/03/AU-BOD-DINNER-MARCH-2026-02-800x445.jpg',
    'https://www.umnews.org/-/media/umc-media/2022/10/20/20/45/au-mageto-profile-1-horizontal-1200x800.jpg',
  ],
  leadership: ['https://africau.edu/wp-content/uploads/2023/12/profmageto-1.png'],
  scholarship: ['https://www.umnews.org/-/media/umc-media/2022/10/20/20/51/au-mageto-profile-2-vertical-280.jpg'],
  strategy: ['https://aunews.africau.edu/wp-content/uploads/2023/11/STRATEGIC-PLAN-MEETING-34-800x445.jpg'],
  roadmap: ['https://africau.edu/wp-content/themes/africau/images/sunset.jpg'],
  contact: ['https://aunews.africau.edu/wp-content/uploads/2026/03/AU-BOD-DINNER-MARCH-2026-02-800x445.jpg'],
  sources: ['https://africau.edu/wp-content/themes/africau/images/profmageto.png'],
};

function getSlideImage(pageKey, slide, slideIdx) {
  if (slide.background_image_url) return slide.background_image_url;
  return SLIDE_IMAGE_FALLBACKS[pageKey]?.[slideIdx] || SLIDE_IMAGE_FALLBACKS[pageKey]?.[0] || '';
}

export default function PageBanner({ pageKey, slides, profile, level = 'h2', ctas }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { setIndex(0); }, [pageKey]);

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
      <div
        className="page-banner-track"
        style={{ transform: `translateX(-${index * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((slide, slideIdx) => {
          const imageUrl = getSlideImage(pageKey, slide, slideIdx);
          const hasImage = Boolean(imageUrl);
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
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  loading={slideIdx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={slideIdx === 0 ? 'high' : 'low'}
                />
              )}
              <div className="page-banner-overlay" />

              <div className="page-banner-copy">
                {slide.eyebrow && <span className="eyebrow">{slide.eyebrow}</span>}
                <Heading>{slide.heading}</Heading>
                {slide.subheading && <p className="lead">{slide.subheading}</p>}
                {slide.body && <p>{slide.body}</p>}
                {slideActions}
              </div>

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
