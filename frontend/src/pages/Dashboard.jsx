import { useEffect } from 'react';
import AdminDashboard from '../components/AdminDashboard.jsx';

export default function Dashboard({ signedIn, token }) {
  useEffect(() => {
    document.title = 'Admin Dashboard | Peter Mageto Portfolio CMS';
  }, []);

  return (
    <section className="page-section">
      <span className="eyebrow">Backend System</span>
      <h1>Admin dashboard and content operations.</h1>
      <p className="lead">
        A real operational layer for profile edits, banner slides, collections, messages, authentication,
        and full content management.
      </p>
      <AdminDashboard signedIn={signedIn} token={token} />
    </section>
  );
}
