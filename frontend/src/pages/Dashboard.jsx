import AdminDashboard from '../components/AdminDashboard.jsx';

export default function Dashboard({ signedIn, token }) {
  return (
    <section className="page-section">
      <span className="eyebrow">Backend System</span>
      <h1>Admin dashboard and content operations.</h1>
      <p className="lead">A real operational layer for messages, content updates, authentication, and future CMS growth.</p>
      <AdminDashboard signedIn={signedIn} token={token} />
    </section>
  );
}
