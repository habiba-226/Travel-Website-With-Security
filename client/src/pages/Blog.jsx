import { useEffect, useState, useRef } from 'react';

const CATEGORIES = [
  'all',
  'City Guides',
  'Destination Deep Dives',
  'Travel Tips',
  'Travel Philosophy',
];

function PostCard({ post, onClick }) {
  const dateStr = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="dest-card" style={{ height: 'auto', cursor: 'pointer' }} onClick={onClick}>
      <div className="img-wrap" style={{ aspectRatio: '16/9' }}>
        <img src={post.image} alt={post.title} loading="lazy" />
        <span
          className="badge-rating"
          style={{ borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem' }}
        >
          {post.category}
        </span>
      </div>
      <div className="body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <img
            src={post.authorAvatar}
            alt={post.author}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {post.author}
          </span>
          <span className="divider-dot"></span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{dateStr}</span>
          <span className="divider-dot"></span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {post.readTime} min read
          </span>
        </div>
        <h3 style={{ fontSize: '1.3rem' }}>{post.title}</h3>
        <p className="desc">{post.excerpt}</p>
        <button
          type="button"
          className="mt-3 d-inline-flex align-items-center gap-2"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--teal-700)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Read story <i className="bi bi-arrow-right"></i>
        </button>
      </div>
    </article>
  );
}

function PostModal({ post, onClose }) {
  const dateStr = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 20, 28, 0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn .2s ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 760,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-strong)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div style={{ position: 'relative', aspectRatio: '16/7', overflow: 'hidden', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
          <img
            src={post.image}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <div
            className="d-inline-block mb-3"
            style={{
              background: 'var(--sand)',
              color: 'var(--teal-900)',
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            {post.category}
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.2 }}>
            {post.title}
          </h2>

          <div className="d-flex align-items-center flex-wrap gap-3 mt-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <img
                src={post.authorAvatar}
                alt={post.author}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {dateStr} · {post.readTime} min read
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: '1.05rem',
              fontStyle: 'italic',
              color: 'var(--muted)',
              borderLeft: '3px solid var(--ochre)',
              paddingLeft: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {post.excerpt}
          </p>

          <p style={{ fontSize: '1rem', lineHeight: 1.8 }}>{post.body}</p>

          <div className="d-flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
            {post.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: 'var(--sand)',
                  color: 'var(--teal-900)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);

  // Debounce search input so we don't fire on every keystroke
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 350);
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((d) => { setPosts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, debouncedSearch]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* ===== Header ===== */}
      <section
        className="section-tight"
        style={{ background: 'var(--sand)', paddingTop: '5rem', paddingBottom: '3rem' }}
      >
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-7 fade-in">
              <div className="section-eyebrow">From the road</div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                Stories worth the read.
              </h1>
              <p className="mt-3 text-muted" style={{ maxWidth: 520 }}>
                Honest guides, slow-travel essays, and the things nobody puts in
                a brochure — written by our travelers and guides.
              </p>
            </div>
            <div className="col-lg-5 mt-4 mt-lg-0">
              <div className="position-relative">
                <i
                  className="bi bi-search position-absolute"
                  style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                ></i>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search stories, places, tips…"
                  value={search}
                  onChange={handleSearchChange}
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

          <div className="d-flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={'filter-pill' + (category === c ? ' active' : '')}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All stories' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Posts ===== */}
      <section className="section-tight">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--teal-700)' }} role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x fs-1" style={{ color: 'var(--muted)' }}></i>
              <h3 className="mt-3">No stories match your search.</h3>
              <p className="text-muted">Try different keywords or clear the filters.</p>
              <button
                className="btn btn-wd-outline mt-2"
                onClick={() => { setCategory('all'); setSearch(''); setDebouncedSearch(''); }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4" style={{ fontSize: '0.92rem' }}>
                <strong>{posts.length}</strong>{' '}
                {posts.length === 1 ? 'story' : 'stories'}
                {debouncedSearch && (
                  <>
                    {' '}for{' '}
                    <strong>"{debouncedSearch}"</strong>
                  </>
                )}
              </p>

              {/* Featured large card */}
              {featured && !debouncedSearch && (
                <div className="mb-5">
                  <article
                    className="dest-card"
                    style={{ height: 'auto', cursor: 'pointer' }}
                    onClick={() => setSelected(featured)}
                  >
                    <div className="row g-0">
                      <div className="col-md-6">
                        <div className="img-wrap" style={{ aspectRatio: '4/3', height: '100%' }}>
                          <img
                            src={featured.image}
                            alt={featured.title}
                            style={{ height: '100%' }}
                          />
                          <span
                            className="badge-rating"
                            style={{ borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem' }}
                          >
                            {featured.category}
                          </span>
                        </div>
                      </div>
                      <div
                        className="col-md-6 d-flex flex-column justify-content-center"
                        style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                      >
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--terracotta)',
                            marginBottom: '0.75rem',
                          }}
                        >
                          Editor's pick
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
                          {featured.title}
                        </h2>
                        <p className="mt-2 text-muted">{featured.excerpt}</p>
                        <div className="d-flex align-items-center gap-2 mt-3">
                          <img
                            src={featured.authorAvatar}
                            alt={featured.author}
                            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            {featured.author} · {featured.readTime} min read
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-wd mt-4 align-self-start"
                        >
                          Read story <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {/* Rest of posts */}
              <div className="row g-4 stagger">
                {(debouncedSearch ? posts : rest).map((post) => (
                  <div className="col-md-6 col-lg-4" key={post.id}>
                    <PostCard post={post} onClick={() => setSelected(post)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Post modal */}
      {selected && (
        <PostModal post={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
