import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm.jsx';
import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides } from '../lib/useProfile.js';

export default function Contact({ signedIn, token }) {
  const slides = useHeroSlides('contact');
  return <><PageBanner pageKey="contact" slides={slides} ctas={<><a href="#contact-form">Send a message</a><Link to="/sources">Check sources</Link></>} /><section id="contact-form" className="page-section two-column"><div><span className="eyebrow">Contact Workflow</span><h2>Structured communication for official enquiries.</h2><p className="lead">The contact area connects public interest to an admin-reviewed workflow, ready for database persistence, email alerts, and official communications approval.</p></div><ContactForm signedIn={signedIn} token={token} /></section></>;
}
