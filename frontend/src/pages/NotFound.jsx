import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-section notice-panel">
      <h1>Page not found</h1>
      <p>The requested route is not part of the leadership portfolio.</p>
      <Link className="button-link" to="/">Return home</Link>
    </section>
  );
}
