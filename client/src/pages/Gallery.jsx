import { useEffect, useState, useCallback } from 'react';

const CATEGORIES = ['all', 'Nature', 'Culture', 'Islands', 'Desert', 'Mountains'];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null); // photo object or null

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    fetch(`/api/gallery?${params}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  // Keyboard navigation for lightbox
  const handleKey = useCallback(
    (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') { setLightbox(null); return; }
      const idx = photos.findIndex((p) => p.id === lightbox.id);
      if (e.key === 'ArrowRight' && idx < photos.length - 1)
        setLightbox(photos[idx + 1]);
      if (e.key === 'ArrowLeft' && idx > 0)
        setLightbox(photos[idx - 1]);
    },
    [lightbox, photos]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const currentIdx = lightbox ? photos.findIndex((p) => p.id === lightbox.id) : -1;

  return (
    <>
      {/* ===== Header ===== */}
      <section
        className="section-tight"
        style={{ background: 'var(--sand)', paddingTop: '5rem', paddingBottom: '3rem' }}
      >
        <div className="container">
          <div className="fade-in">
            <div className="section-eyebrow">Visual diary</div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
              Places that look better in person.
            </h1>
            <p className="mt-3 text-muted" style={{ maxWidth: 560 }}>
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

      {/* ===== Masonry grid ===== */}
      <section className="section-tight">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--teal-700)' }} role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : (
            <div
              className="stagger"
              style={{
                columns: 'var(--gallery-cols, 3)',
                columnGap: '1rem',
              }}
            >
              <style>{`
                @media (max-width: 576px) { :root { --gallery-cols: 1; } }
                @media (min-width: 577px) and (max-width: 992px) { :root { --gallery-cols: 2; } }
                @media (min-width: 993px) { :root { --gallery-cols: 3; } }
              `}</style>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{ breakInside: 'avoid', marginBottom: '1rem' }}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(photo)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      width: '100%',
                      cursor: 'zoom-in',
                      display: 'block',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    aria-label={`View ${photo.title}`}
                  >
                    <img
                      src={photo.image}
                      alt={photo.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        transition: 'transform .5s ease',
                        borderRadius: 'var(--radius-md)',
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.03)')}
                      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    />
                    {/* Hover overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(13,59,79,0.75) 0%, transparent 50%)',
                        opacity: 0,
                        transition: 'opacity .3s',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '1rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div
                          style={{
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          {photo.title}
                        </div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.78rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginTop: '0.2rem',
                          }}
                        >
                          {photo.location}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Lightbox ===== */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 20, 28, 0.95)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn .25s ease both',
          }}
        >
          {/* Image */}
          <img
            src={lightbox.image}
            alt={lightbox.title}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
            }}
          />

          {/* Caption */}
          <div
            className="text-center mt-3"
            onClick={(e) => e.stopPropagation()}
            style={{ color: '#fff' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 600,
              }}
            >
              {lightbox.title}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.82rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginTop: '0.25rem',
              }}
            >
              <i className="bi bi-geo-alt me-1"></i>
              {lightbox.location}
              <span className="divider-dot"></span>
              {lightbox.category}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem',
                marginTop: '0.5rem',
              }}
            >
              {currentIdx + 1} / {photos.length} &nbsp;·&nbsp; Esc to close &nbsp;·&nbsp; ← → to navigate
            </div>
          </div>

          {/* Prev / Next arrows */}
          {currentIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(photos[currentIdx - 1]); }}
              aria-label="Previous photo"
              style={{
                position: 'fixed',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                transition: 'background .2s',
              }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          )}
          {currentIdx < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(photos[currentIdx + 1]); }}
              aria-label="Next photo"
              style={{
                position: 'fixed',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                transition: 'background .2s',
              }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 44,
              height: 44,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}
    </>
  );
}
