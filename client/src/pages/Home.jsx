import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // Featured destinations from the API
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Newsletter form state
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

  // ----- Client-side validation -----
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
      {/* ============== HERO ============== */}
      <section className="hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-xl-7 fade-in">
              <div className="eyebrow">Slow travel, well planned</div>
              <h1>
                Find the road <em style={{ color: 'var(--ochre)', fontStyle: 'italic' }}>less hurried.</em>
              </h1>
              <p className="lead mt-4">
                Wanderly designs unhurried journeys for travelers who'd rather
                linger at a sunset than rush a checklist. Discover hand-picked
                destinations across nine continents of feeling.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-5">
                <Link to="/destinations" className="btn btn-wd">
                  Explore destinations <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link
                  to="/booking"
                  className="btn btn-wd-outline"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  Book a trip
                </Link>
              </div>

              <div className="d-flex flex-wrap gap-4 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff' }}>9+</div>
                  <small style={{ letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>
                    Destinations
                  </small>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff' }}>4.9★</div>
                  <small style={{ letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>
                    Avg. rating
                  </small>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff' }}>12k+</div>
                  <small style={{ letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>
                    Travelers
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FEATURED DESTINATIONS ============== */}
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
              <div className="spinner-border" style={{ color: 'var(--teal-700)' }} role="status">
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

      {/* ============== WHY WANDERLY ============== */}
      <section className="section-tight" style={{ background: 'var(--sand)' }}>
        <div className="container py-4">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5">
              <div className="section-eyebrow">Why Wanderly</div>
              <h2>Trips designed by people who actually go.</h2>
            </div>
            <div className="col-lg-7">
              <div className="row g-4">
                <div className="col-sm-6">
                  <i className="bi bi-compass fs-2" style={{ color: 'var(--terracotta)' }}></i>
                  <h3 className="mt-3" style={{ fontSize: '1.25rem' }}>Hand-picked routes</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Every itinerary is scouted in person, not assembled from a brochure.
                  </p>
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-people fs-2" style={{ color: 'var(--terracotta)' }}></i>
                  <h3 className="mt-3" style={{ fontSize: '1.25rem' }}>Small groups</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Twelve travelers, max. Real conversations, real local guides.
                  </p>
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-tree fs-2" style={{ color: 'var(--terracotta)' }}></i>
                  <h3 className="mt-3" style={{ fontSize: '1.25rem' }}>Slow & sustainable</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Fewer stops, longer stays — kinder to places and to you.
                  </p>
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-shield-check fs-2" style={{ color: 'var(--terracotta)' }}></i>
                  <h3 className="mt-3" style={{ fontSize: '1.25rem' }}>24/7 on-trip support</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    A real human, one timezone away, the whole way through.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== NEWSLETTER (FORM #1) ============== */}
      <section className="section">
        <div className="container">
          <div className="newsletter-band">
            <div className="row align-items-center gy-4 position-relative">
              <div className="col-lg-6">
                <div className="section-eyebrow" style={{ color: 'var(--ochre)' }}>
                  The dispatch
                </div>
                <h2 className="mb-3">Letters from the road, every other Friday.</h2>
                <p className="mb-0" style={{ opacity: 0.85, maxWidth: 460 }}>
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
                    <div
                      className={
                        'alert-wd mt-3 ' +
                        (status.type === 'success' ? 'alert-success-wd' : 'alert-error-wd')
                      }
                    >
                      <i
                        className={
                          'bi me-2 ' +
                          (status.type === 'success'
                            ? 'bi-check-circle-fill'
                            : 'bi-exclamation-circle-fill')
                        }
                      ></i>
                      {status.text}
                    </div>
                  )}
                  <small style={{ opacity: 0.6, display: 'block', marginTop: '0.75rem' }}>
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
