import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Global.css';
import '../styles/Tours.css';

const CATEGORIES = [
  'all',
  'Island',
  'Culture',
  'Adventure',
  'Wilderness',
  'Wellness',
];

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
      <section className="section-tight page-header">
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-8 fade-in">
              <div className="section-eyebrow">Curated packages</div>
              <h1 className="hero-title">Everything planned. Nothing scripted.</h1>
              <p className="mt-3 text-muted hero-subtitle">
                Each package is a hand-built itinerary — not a template. Flights,
                stays, activities, and a guide who's done it themselves, all in one price.
              </p>
            </div>
          </div>
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

      <section className="section-tight">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-teal" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : (
            <div className="row g-4 stagger align-items-start">
              {tours.map((t) => {
                const open = expanded === t.id;
                return (
                  <div className="col-lg-6" key={t.id}>
                    <article className="dest-card tour-card">
                      <div className="img-wrap img-wrap-16-9">
                        <img src={t.image} alt={t.title} loading="lazy" />
                        <span className="badge-rating">
                          <i className="bi bi-star-fill"></i> {t.rating}
                          <span className="divider-dot divider-dot-sm"></span>
                          {t.reviews} reviews
                        </span>
                      </div>

                      <div className="body">
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className={`badge diff-tag diff-${t.difficulty.replace(/\s+/g, '')}`}>
                            {t.difficulty}
                          </span>
                          <span className="badge tag-pill-sm">{t.category}</span>
                        </div>

                        <div className="country">{t.destination}</div>
                        <h3 className="tour-title">{t.title}</h3>
                        <p className="desc">{t.description}</p>

                        <div className="d-flex gap-4 mt-3 pt-3 tour-stats">
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

                        <button
                          type="button"
                          className="btn btn-toggle-details mt-3"
                          onClick={() => setExpanded(open ? null : t.id)}
                          aria-expanded={open}
                        >
                          <i className={`bi bi-chevron-${open ? 'up' : 'down'} me-2`}></i>
                          {open ? 'Hide details' : 'Show highlights & inclusions'}
                        </button>

                        {open && (
                          <div className="mt-3 fade-in">
                            <div className="row g-3">
                              <div className="col-sm-6">
                                <div className="detail-heading">Highlights</div>
                                <ul className="list-unstyled detail-list">
                                  {t.highlights.map((h, i) => (
                                    <li key={i} className="d-flex gap-2 mb-2">
                                      <i className="bi bi-check2 icon-check"></i>
                                      {h}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="col-sm-6">
                                <div className="detail-heading">Included</div>
                                <ul className="list-unstyled detail-list mb-3">
                                  {t.included.map((item, i) => (
                                    <li key={i} className="d-flex gap-2 mb-1">
                                      <i className="bi bi-check-circle-fill icon-check-fill"></i>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                                <div className="detail-heading">Not included</div>
                                <ul className="list-unstyled detail-list mb-0">
                                  {t.excluded.map((item, i) => (
                                    <li key={i} className="d-flex gap-2 mb-1">
                                      <i className="bi bi-x-circle icon-cross"></i>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

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

      <section className="section-tight">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 p-4 p-md-5 cta-band">
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