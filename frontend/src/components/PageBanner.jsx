import { useEffect, useState } from 'react';

export default function PageBanner({ pageKey, slides, level = 'h2', ctas }) {
  const [index, setIndex] = useState(0);
  const activeSlide = slides?.[index] || slides?.[0] || null;

  useEffect(() => { setIndex(0); }, [pageKey]);
  useEffect(() => {
    if (!slides || slides.length < 2) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!activeSlide) return null;
  const Heading = level;
  const hasImage = Boolean(activeSlide.background_image_url);

  return (
    <section className={`page-banner page-banner--${pageKey} ${hasImage ? 'has-image' : 'no-image'}`}>
      {hasImage && <img className="page-banner-bg" src={activeSlide.background_image_url} alt="" aria-hidden="true" />}
      <div className="page-banner-overlay" />
      <aside className="page-banner-card">
        <span className="avatar">PM</span>
        <strong>Rev. Prof. Peter Mageto</strong>
        <span>Fifth Vice Chancellor | Africa University</span>
        {activeSlide.panel_caption && <p>{activeSlide.panel_caption}</p>}
      </aside>
      <div className="page-banner-copy">
        {activeSlide.eyebrow && <span className="eyebrow">{activeSlide.eyebrow}</span>}
        <Heading>{activeSlide.heading}</Heading>
        {activeSlide.subheading && <p className="lead">{activeSlide.subheading}</p>}
        {activeSlide.body && <p>{activeSlide.body}</p>}
        {ctas && <div className="hero-actions">{ctas}</div>}
      </div>
      {slides && slides.length > 1 && <div className="page-banner-dots" role="tablist" aria-label="Banner slides">{slides.map((slide, i) => <button key={slide.id} type="button" role="tab" aria-selected={i === index} aria-label={`Show slide ${i + 1}`} className={i === index ? 'active' : ''} onClick={() => setIndex(i)} />)}</div>}
    </section>
  );
}
