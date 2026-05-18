import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

const FEATURES = [
  { icon: 'bi-map', title: 'Handpicked Destinations', text: 'Every destination is personally vetted for an authentic experience.' },
  { icon: 'bi-people', title: 'Small Groups', text: 'Maximum 12 people per trip — real connections, no crowds.' },
  { icon: 'bi-hourglass-split', title: 'Slow Travel', text: 'We believe in savoring places, not rushing through them.' },
  { icon: 'bi-headset', title: '24/7 Support', text: 'Our team is always reachable, wherever you are in the world.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section
        className="text-white text-center py-5"
        style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)', minHeight: '60vh', display: 'flex', alignItems: 'center' }}
      >
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">Find the road less hurried</h1>
          <p className="lead mb-4 opacity-90">
            Handpicked destinations, small groups, and slow travel — that&apos;s the Wanderly way.
          </p>
          <Link to="/destinations" className="btn btn-light btn-lg me-3 fw-semibold">
            <i className="bi bi-compass me-2" />
            Explore Destinations
          </Link>
          <Link to="/blog" className="btn btn-outline-light btn-lg fw-semibold">
            <i className="bi bi-journal-text me-2" />
            Read Our Blog
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-light py-4">
        <div className="container">
          <div className="row text-center g-3">
            {[
              { value: '6+',   label: 'Destinations' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '12k+', label: 'Happy Travelers' },
            ].map(s => (
              <div key={s.label} className="col-4">
                <h3 className="fw-bold text-primary mb-0">{s.value}</h3>
                <p className="text-muted small mb-0">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Why travel with Wanderly?</h2>
          <div className="row g-4">
            {FEATURES.map(f => (
              <div key={f.title} className="col-sm-6 col-md-3 text-center">
                <i className={`bi ${f.icon} fs-1 text-primary mb-3 d-block`} />
                <h5 className="fw-bold">{f.title}</h5>
                <p className="text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-5 text-center">
        <div className="container">
          <h2 className="fw-bold mb-2">
            Ready to start your journey{user?.username ? `, ${user.username}` : ''}?
          </h2>
          <p className="opacity-75 mb-4">Pick a destination and let us handle the rest.</p>
          <Link to="/destinations" className="btn btn-light btn-lg fw-semibold">
            View All Destinations
          </Link>
        </div>
      </section>
    </div>
  );
}