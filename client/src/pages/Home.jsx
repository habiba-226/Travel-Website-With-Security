import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Global.css';
import '../styles/Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data) => {
        setFeatured(data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (name && name.trim().length < 2) {
      e.name = 'Name should be at least 2 characters.';
    }
    return e;
  };

  const handleSubscribe = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setStatus({ type: '', text: '' });
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'Subscription failed.' });
      } else {
        setStatus({ type: 'success', text: data.message });
        setEmail('');
        setName('');
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-xl-7 fade-in">
              <div className="section-eyebrow text-white opacity-75">Slow travel, well planned</div>
              <h1>
                Find the road <em className="hero-highlight">less hurried.</em>
              </h1>
              <p className="hero-lead mt-4">
                Wanderly designs unhurried journeys for travelers who'd rather
                linger at a sunset than rush a checklist. Discover hand-picked
                destinations across nine continents of feeling.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-5">
                <Link to="/destinations" className="btn btn-wd">
                  Explore destinations <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/booking" className="btn btn-wd-outline-light">
                  Book a trip
                </Link>
              </div>

              <div className="d-flex flex-wrap gap-4 mt-5 pt-4 hero-stats-band">
                <div>
                  <div className="stat-number">9+</div>
                  <small className="stat-label">Destinations</small>
                </div>
                <div>
                  <div className="stat-number">4.9★</div>
                  <small className="stat-label">Avg. rating</small>
                </div>
                <div>
                  <div className="stat-number">12k+</div>
                  <small className="stat-label">Travelers</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-end mb-5">
            <div className="col-lg-7">
              <div className="section-eyebrow">Now boarding</div>
              <h2>Three places worth the long flight.</h2>
            </div>
            <div className="col-lg-5 text-lg-end mt-3 mt-lg-0">
              <Link to="/destinations" className="btn btn-wd-outline">
                See all destinations <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-teal" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4 stagger">
              {featured.map((d) => (
                <div className="col-md-6 col-lg-4" key={d.id}>
                  <article className="dest-card">
                    <div className="img-wrap">
                      <img src={d.image} alt={d.name} loading="lazy" />
                      <span className="badge-rating">
                        <i className="bi bi-star-fill"></i> {d.rating}
                      </span>
                    </div>
                    <div className="body">
                      <div className="country">{d.country}</div>
                      <h3>{d.name}</h3>
                      <p className="desc">{d.description}</p>
                      <div className="meta">
                        <div>
                          <small>From</small>
                          <div className="price">${d.price.toLocaleString()}</div>
                        </div>
                        <div className="duration">
                          <i className="bi bi-calendar3 me-1"></i>
                          {d.duration} days
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-tight bg-sand">
        <div className="container py-4">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5">
              <div className="section-eyebrow">Why Wanderly</div>
              <h2>Trips designed by people who actually go.</h2>
            </div>
            <div className="col-lg-7">
              <div className="row g-4">
                <div className="col-sm-6">
                  <i className="bi bi-compass fs-2 icon-terracotta"></i>
                  <h3 className="mt-3 feature-title">Hand-picked routes</h3>
                  <p className="text-muted mb-0 feature-desc">
                    Every itinerary is scouted in person, not assembled from a brochure.
                  </p>
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-people fs-2 icon-terracotta"></i>
                  <h3 className="mt-3 feature-title">Small groups</h3>
                  <p className="text-muted mb-0 feature-desc">
                    Twelve travelers, max. Real conversations, real local guides.
                  </p>
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-tree fs-2 icon-terracotta"></i>
                  <h3 className="mt-3 feature-title">Slow & sustainable</h3>
                  <p className="text-muted mb-0 feature-desc">
                    Fewer stops, longer stays — kinder to places and to you.
                  </p>
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-shield-check fs-2 icon-terracotta"></i>
                  <h3 className="mt-3 feature-title">24/7 on-trip support</h3>
                  <p className="text-muted mb-0 feature-desc">
                    A real human, one timezone away, the whole way through.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="newsletter-band">
            <div className="row align-items-center gy-4 position-relative">
              <div className="col-lg-6">
                <div className="eyebrow-ochre">The dispatch</div>
                <h2 className="mb-3">Letters from the road, every other Friday.</h2>
                <p className="mb-0 newsletter-desc">
                  Stories, photo essays, and the occasional flight deal —
                  written by our travelers, for yours.
                </p>
              </div>
              <div className="col-lg-6">
                <form onSubmit={handleSubscribe} noValidate>
                  <div className="mb-3">
                    <input
                      type="text"
                      className={'form-control' + (errors.name ? ' is-invalid' : '')}
                      placeholder="Your first name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <input
                      type="email"
                      className={'form-control flex-grow-1' + (errors.email ? ' is-invalid' : '')}
                      placeholder="you@somewhere.com"
                      value={email}
                      style={{ minWidth: '210px' }}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-newsletter" disabled={submitting}>
                      {submitting ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  </div>
                  {errors.email && (
                    <div className="invalid-feedback d-block mt-2">{errors.email}</div>
                  )}
                  {status.text && (
                    <div className={'alert-wd mt-3 ' + (status.type === 'success' ? 'alert-success-wd' : 'alert-error-wd')}>
                      <i className={'bi me-2 ' + (status.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill')}></i>
                      {status.text}
                    </div>
                  )}
                  <small className="newsletter-legal">
                    No spam, ever. Unsubscribe anytime.
                  </small>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}