import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'all',
  'Beach & Island',
  'Culture & History',
  'Adventure & Culture',
  'Nature & Adventure',
  'Wellness & Beach',
];

const DIFFICULTY_COLOR = {
  Easy: { bg: '#e8f5e9', color: '#1b5e20' },
  Moderate: { bg: '#fff8e1', color: '#7c5900' },
  Challenging: { bg: '#fdecea', color: '#7a1f14' },
};

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    fetch(`/api/tours?${params}`)
      .then((r) => r.json())
      .then((d) => { setTours(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <>
      {/* ===== Header ===== */}
      <section
        className="section-tight"
        style={{ background: 'var(--sand)', paddingTop: '5rem', paddingBottom: '3rem' }}
      >
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-8 fade-in">
              <div className="section-eyebrow">Curated packages</div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                Everything planned. Nothing scripted.
              </h1>
              <p className="mt-3 text-muted" style={{ maxWidth: 580 }}>
                Each package is a hand-built itinerary — not a template. Flights,
                stays, activities, and a guide who's done it themselves, all in one price.
              </p>
            </div>
          </div>

          {/* Category filter */}
          <div className="d-flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={'filter-pill' + (category === c ? ' active' : '')}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All packages' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tour cards ===== */}
      <section className="section-tight">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--teal-700)' }} role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : (
            <div className="row g-4 stagger">
              {tours.map((t) => {
                const diff = DIFFICULTY_COLOR[t.difficulty] || DIFFICULTY_COLOR.Easy;
                const open = expanded === t.id;
                return (
                  <div className="col-lg-6" key={t.id}>
                    <article
                      className="dest-card"
                      style={{ height: 'auto' }}
                    >
                      {/* Image */}
                      <div className="img-wrap" style={{ aspectRatio: '16/9' }}>
                        <img src={t.image} alt={t.title} loading="lazy" />
                        <span className="badge-rating">
                          <i className="bi bi-star-fill"></i> {t.rating}
                          <span
                            className="divider-dot"
                            style={{ margin: '0 0.4rem' }}
                          ></span>
                          {t.reviews} reviews
                        </span>
                      </div>

                      <div className="body">
                        {/* Tags row */}
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span
                            className="badge"
                            style={{
                              background: diff.bg,
                              color: diff.color,
                              padding: '0.35rem 0.7rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {t.difficulty}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: 'var(--sand)',
                              color: 'var(--teal-900)',
                              padding: '0.35rem 0.7rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {t.category}
                          </span>
                        </div>

                        <div className="country">{t.destination}</div>
                        <h3 style={{ fontSize: '1.45rem' }}>{t.title}</h3>
                        <p className="desc">{t.description}</p>

                        {/* Quick stats */}
                        <div
                          className="d-flex gap-4 mt-3 pt-3"
                          style={{ borderTop: '1px solid var(--line)', fontSize: '0.88rem', color: 'var(--muted)' }}
                        >
                          <span>
                            <i className="bi bi-calendar3 me-1"></i>
                            {t.duration} days
                          </span>
                          <span>
                            <i className="bi bi-people me-1"></i>
                            Max {t.groupSize} pax
                          </span>
                          <span>
                            <i className="bi bi-geo-alt me-1"></i>
                            {t.country}
                          </span>
                        </div>

                        {/* Expandable highlights */}
                        <button
                          type="button"
                          className="btn p-0 mt-3 d-flex align-items-center gap-2"
                          style={{ color: 'var(--teal-700)', fontWeight: 600, fontSize: '0.9rem' }}
                          onClick={() => setExpanded(open ? null : t.id)}
                          aria-expanded={open}
                        >
                          <i className={`bi bi-chevron-${open ? 'up' : 'down'}`}></i>
                          {open ? 'Hide details' : 'Show highlights & inclusions'}
                        </button>

                        {open && (
                          <div className="mt-3 fade-in">
                            <div className="row g-3">
                              <div className="col-sm-6">
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: 'var(--muted)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  Highlights
                                </div>
                                <ul className="list-unstyled mb-0" style={{ fontSize: '0.88rem' }}>
                                  {t.highlights.map((h, i) => (
                                    <li key={i} className="d-flex gap-2 mb-2">
                                      <i
                                        className="bi bi-check2"
                                        style={{ color: 'var(--teal-700)', flexShrink: 0, marginTop: 2 }}
                                      ></i>
                                      {h}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="col-sm-6">
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: 'var(--muted)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  Included
                                </div>
                                <ul className="list-unstyled mb-3" style={{ fontSize: '0.88rem' }}>
                                  {t.included.map((item, i) => (
                                    <li key={i} className="d-flex gap-2 mb-1">
                                      <i
                                        className="bi bi-check-circle-fill"
                                        style={{ color: '#2e7d32', flexShrink: 0, marginTop: 2 }}
                                      ></i>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: 'var(--muted)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  Not included
                                </div>
                                <ul className="list-unstyled mb-0" style={{ fontSize: '0.88rem' }}>
                                  {t.excluded.map((item, i) => (
                                    <li key={i} className="d-flex gap-2 mb-1">
                                      <i
                                        className="bi bi-x-circle"
                                        style={{ color: 'var(--terracotta)', flexShrink: 0, marginTop: 2 }}
                                      ></i>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Price + CTA */}
                        <div className="meta mt-4">
                          <div>
                            <div className="price">
                              ${t.price.toLocaleString()}
                              <small>per person</small>
                            </div>
                          </div>
                          <Link
                            to={`/booking?destination=${encodeURIComponent(t.destination)}`}
                            className="btn btn-wd"
                          >
                            Book now
                          </Link>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA band ===== */}
      <section className="section-tight">
        <div className="container">
          <div
            className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 p-4 p-md-5"
            style={{
              background: 'var(--sand)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
            }}
          >
            <div>
              <h3 className="mb-1">Don't see the right package?</h3>
              <p className="text-muted mb-0">
                We build bespoke itineraries too. Tell us where you want to go and we'll
                design something around you.
              </p>
            </div>
            <Link to="/booking" className="btn btn-wd flex-shrink-0">
              Request custom trip
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
