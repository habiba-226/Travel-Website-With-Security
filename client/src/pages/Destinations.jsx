import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CONTINENTS = [
  'all',
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
];

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [continent, setContinent] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch from backend whenever a filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (continent !== 'all') params.append('continent', continent);
    if (search.trim()) params.append('search', search.trim());

    fetch(`/api/destinations?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDestinations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [continent, search]);

  return (
    <>
      {/* ===== Page header ===== */}
      <section
        className="section-tight"
        style={{ background: 'var(--sand)', paddingTop: '5rem', paddingBottom: '3rem' }}
      >
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-8 fade-in">
              <div className="section-eyebrow">The atlas</div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                Nine places. Nine entirely different feelings.
              </h1>
              <p className="mt-3 text-muted" style={{ maxWidth: 600 }}>
                Filter by continent, search by mood, or just scroll until
                something catches the corner of your eye.
              </p>
            </div>
            <div className="col-lg-4 mt-4 mt-lg-0">
              <div className="position-relative">
                <i
                  className="bi bi-search position-absolute"
                  style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                ></i>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search destinations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderRadius: '999px',
                    border: '1.5px solid var(--line)',
                    background: '#fff',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Continent filter pills */}
          <div className="d-flex flex-wrap gap-2 mt-4">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                type="button"
                className={'filter-pill' + (continent === c ? ' active' : '')}
                onClick={() => setContinent(c)}
              >
                {c === 'all' ? 'All places' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Grid ===== */}
      <section className="section-tight">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--teal-700)' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-compass fs-1" style={{ color: 'var(--muted)' }}></i>
              <h3 className="mt-3">No destinations match your filters.</h3>
              <p className="text-muted">Try a different continent or clear your search.</p>
              <button
                className="btn btn-wd-outline mt-2"
                onClick={() => {
                  setContinent('all');
                  setSearch('');
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4" style={{ fontSize: '0.92rem' }}>
                Showing <strong>{destinations.length}</strong>{' '}
                {destinations.length === 1 ? 'destination' : 'destinations'}
                {continent !== 'all' && (
                  <>
                    <span className="divider-dot"></span>
                    {continent}
                  </>
                )}
              </p>
              <div className="row g-4 stagger">
                {destinations.map((d) => (
                  <div className="col-md-6 col-lg-4" key={d.id}>
                    <article className="dest-card">
                      <div className="img-wrap">
                        <img src={d.image} alt={d.name} loading="lazy" />
                        <span className="badge-rating">
                          <i className="bi bi-star-fill"></i> {d.rating}
                        </span>
                      </div>
                      <div className="body">
                        <div className="country">
                          {d.country} <span className="divider-dot"></span> {d.continent}
                        </div>
                        <h3>{d.name}</h3>
                        <p className="desc">{d.description}</p>
                        <div className="d-flex flex-wrap gap-1 mt-2 mb-3">
                          {d.tags.map((t) => (
                            <span
                              key={t}
                              className="badge"
                              style={{
                                background: 'var(--sand)',
                                color: 'var(--teal-900)',
                                fontWeight: 500,
                                padding: '0.35rem 0.7rem',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
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
                        <Link
                          to={`/booking?destination=${encodeURIComponent(d.name)}`}
                          className="btn btn-wd w-100 mt-3"
                        >
                          Book this trip
                        </Link>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
