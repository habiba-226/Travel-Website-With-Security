import { useEffect, useState, useCallback } from 'react';
import '../styles/Global.css';
import '../styles/Gallery.css';

const CATEGORIES = ['all', 'Nature', 'Culture', 'Islands', 'Desert', 'Mountains'];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null); 

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    fetch(`/api/gallery?${params}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  const handleKey = useCallback(
    (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') { setLightbox(null); return; }
      const idx = photos.findIndex((p) => p.id === lightbox.id);
      if (e.key === 'ArrowRight' && idx < photos.length - 1) setLightbox(photos[idx + 1]);
      if (e.key === 'ArrowLeft' && idx > 0) setLightbox(photos[idx - 1]);
    },
    [lightbox, photos]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const currentIdx = lightbox ? photos.findIndex((p) => p.id === lightbox.id) : -1;

  return (
    <>
      <section className="section-tight page-header">
        <div className="container">
          <div className="fade-in">
            <div className="section-eyebrow">Visual diary</div>
            <h1 className="hero-title">Places that look better in person.</h1>
            <p className="mt-3 text-muted hero-subtitle">
              A curated collection of photographs from Wanderly journeys. Click any
              image to open it — use arrow keys to navigate.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={'filter-pill' + (category === c ? ' active' : '')}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All photos' : c}
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
            <div className="gallery-grid stagger">
              {photos.map((photo) => (
                <div key={photo.id} className="gallery-item">
                  <button
                    type="button"
                    onClick={() => setLightbox(photo)}
                    className="gallery-btn"
                    aria-label={`View ${photo.title}`}
                  >
                    <img src={photo.image} alt={photo.title} loading="lazy" className="gallery-img" />
                    <div className="gallery-overlay">
                      <div>
                        <div className="gallery-overlay-title">{photo.title}</div>
                        <div className="gallery-overlay-loc">{photo.location}</div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)} className="lightbox-overlay">
          <img src={lightbox.image} alt={lightbox.title} onClick={(e) => e.stopPropagation()} className="lightbox-img" />
          <div className="lightbox-caption" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-title">{lightbox.title}</div>
            <div className="lightbox-loc">
              <i className="bi bi-geo-alt me-1"></i>{lightbox.location}
              <span className="divider-dot"></span>{lightbox.category}
            </div>
            <div className="lightbox-meta">
              {currentIdx + 1} / {photos.length} &nbsp;·&nbsp; Esc to close &nbsp;·&nbsp; ← → to navigate
            </div>
          </div>

          {currentIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(photos[currentIdx - 1]); }} aria-label="Previous photo" className="lightbox-nav nav-prev">
              <i className="bi bi-chevron-left"></i>
            </button>
          )}
          {currentIdx < photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(photos[currentIdx + 1]); }} aria-label="Next photo" className="lightbox-nav nav-next">
              <i className="bi bi-chevron-right"></i>
            </button>
          )}
          <button onClick={() => setLightbox(null)} aria-label="Close lightbox" className="lightbox-close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}
    </>
  );
}