import ContactForm from '../components/ContactForm.jsx';

export default function Contact({ signedIn, token }) {
  return (
    <section className="page-section two-column">
      <div>
        <span className="eyebrow">Contact Workflow</span>
        <h1>Structured communication for official enquiries.</h1>
        <p className="lead">The contact area connects public interest to an admin-reviewed workflow, ready for database persistence, email alerts, and official communications approval.</p>
      </div>
      <ContactForm signedIn={signedIn} token={token} />
    </section>
  );
}
