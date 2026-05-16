import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputVal, setInputVal] = useState('');

  // VULNERABILITY (Reflected XSS): the `q` param from the URL is rendered via dangerouslySetInnerHTML
  const search = searchParams.get('q') || '';

  useEffect(() => {
    setInputVal(search);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const url = search ? `/api/destinations?search=${encodeURIComponent(search)}` : '/api/destinations';
    fetch(url, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setDestinations(data);
      })
      .catch(() => setError('Failed to load destinations'))
      .finally(() => setLoading(false));
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(inputVal.trim() ? { q: inputVal } : {});
  };

  const clearSearch = () => {
    setInputVal('');
    setSearchParams({});
  };

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-1">Explore Destinations</h1>

      {/* VULNERABILITY (Reflected XSS): search term injected into DOM without sanitization */}
      {search && (
        <p className="text-muted mb-3">
          Showing results for:{' '}
          <strong>
            <span dangerouslySetInnerHTML={{ __html: search }} />
          </strong>
        </p>
      )}

      <form onSubmit={handleSearch} className="mb-4 d-flex gap-2" style={{ maxWidth: 450 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search destinations or countries..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
        />
        <button type="submit" className="btn btn-primary px-4">Search</button>
        {search && (
          <button type="button" className="btn btn-outline-secondary" onClick={clearSearch}>Clear</button>
        )}
      </form>

      {/* SQL error exposed to user — VULNERABILITY */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong>
          <pre className="mb-0 mt-1" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      )}

      {!loading && !error && (
        <div className="row g-4">
          {destinations.map(dest => (
            <div key={dest.id} className="col-sm-6 col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <img
                  src={dest.image}
                  className="card-img-top"
                  alt={dest.name}
                  style={{ height: 200, objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold mb-1">{dest.name}</h5>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-geo-alt me-1" />{dest.country}
                  </p>
                  <p className="card-text text-muted flex-grow-1">{dest.description}</p>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="fw-bold text-primary fs-5">${dest.price}</span>
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-clock me-1" />{dest.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {destinations.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-compass fs-1 d-block mb-3" />
              <p className="fs-5">No destinations found.</p>
              <button className="btn btn-outline-primary" onClick={clearSearch}>Clear search</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
