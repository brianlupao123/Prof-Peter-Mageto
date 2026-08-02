import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaGlobe, FaPhone } from 'react-icons/fa6';
import ContactForm from '../components/ContactForm.jsx';
import PageBanner from '../components/PageBanner.jsx';
import EngagementSection from '../components/EngagementSection.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Contact({ signedIn, token }) {
  const slides = useHeroSlides('contact');
  const { data } = useProfile();
  const profile = data?.profile;

  useEffect(() => {
    document.title = 'Contact | Office of the Vice Chancellor — Africa University';
  }, []);

  return (
    <>
      <PageBanner
        pageKey="contact"
        slides={slides}
        profile={data?.profile}
        ctas={
          <>
            <a href="#contact-form">Send enquiry</a>
            <Link to="/contact?request=meeting#contact-form">Request meeting</Link>
            <Link to="/contact?request=speaking#contact-form">Invite to speak</Link>
            <Link to="/contact?request=media#contact-form">Media enquiry</Link>
          </>
        }
      />
      <EngagementSection pageKey="contact" />
      <section id="contact-form" className="page-section two-column">
        {/* Office info panel */}
        <div>
          <span className="eyebrow">Contact Workflow</span>
          <h2>Structured requests, routed to a real inbox.</h2>
          <p className="lead">
            Send an enquiry, appointment request, speaking invitation, partnership note, or media verification request. Each submission is logged in the admin dashboard for review, status tracking, and follow-up.
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <FaBuilding style={{ color: 'var(--accent)', marginTop: '0.15rem', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block' }}>Office of the Vice Chancellor</strong>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {profile?.address || 'Africa University | Old Mutare, Mutare, Zimbabwe'}
                </span>
              </div>
            </div>
            {profile?.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaEnvelope style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <a href={`mailto:${profile.email}`} style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>{profile.email}</a>
              </div>
            )}
            {profile?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaPhone style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <a href={`tel:${profile.phone}`} style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>{profile.phone}</a>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaGlobe style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <a href="https://africau.edu/about/contact-us/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>
                Official Africa University contact page ↗
              </a>
            </div>
          </div>
        </div>

        <ContactForm signedIn={signedIn} token={token} />
      </section>
    </>
  );
}





