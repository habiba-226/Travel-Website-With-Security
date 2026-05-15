import { useEffect, useState, useRef } from 'react';
import '../styles/Global.css';
import '../styles/Blog.css';

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
    <article className="dest-card post-card" onClick={onClick}>
      <div className="img-wrap img-wrap-16-9">
        <img src={post.image} alt={post.title} loading="lazy" className="img-cover" />
        <span className="badge-rating">{post.category}</span>
      </div>
      <div className="body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <img src={post.authorAvatar} alt={post.author} className="avatar-sm" />
          <span className="text-muted-sm">{post.author}</span>
          <span className="divider-dot"></span>
          <span className="text-muted-sm">{dateStr}</span>
          <span className="divider-dot"></span>
          <span className="text-muted-sm">{post.readTime} min read</span>
        </div>
        <h3 className="post-title">{post.title}</h3>
        <p className="desc">{post.excerpt}</p>
        <button type="button" className="mt-3 d-inline-flex align-items-center gap-2 btn-read-more">
          Read story <i className="bi bi-arrow-right"></i>
        </button>
      </div>
    </article>
  );
}

function Comments() {
  const [comments, setComments] = useState([
    { id: 1, user: 'Alex', text: 'This guide was incredibly helpful for my trip!' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // Note: Raw input used here for your future XSS testing payload!
    setComments([...comments, { id: Date.now(), user: 'Guest', text: newComment }]);
    setNewComment('');
  };

  return (
    <div className="mt-5 pt-4 border-top-line">
      <h4 className="mb-3">Community Thoughts</h4>
      <div className="mb-4">
        {comments.map(c => (
          <div key={c.id} className="mb-2 p-3" style={{ background: 'var(--sand)', borderRadius: 'var(--radius-sm)' }}>
            <strong>{c.user}:</strong> {c.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input 
          className="form-control" 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit" className="btn btn-wd">Post</button>
      </form>
    </div>
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hero">
          <img src={post.image} alt={post.title} className="img-cover" />
          <button onClick={onClose} aria-label="Close" className="modal-close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-category">{post.category}</div>
          <h2 className="modal-title">{post.title}</h2>

          <div className="d-flex align-items-center flex-wrap gap-3 mt-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <img src={post.authorAvatar} alt={post.author} className="avatar-lg" />
              <div>
                <div className="fw-bold-sm">{post.author}</div>
                <div className="text-muted-xs">
                  {dateStr} · {post.readTime} min read
                </div>
              </div>
            </div>
          </div>

          <p className="modal-excerpt">{post.excerpt}</p>
          <p className="modal-text">{post.body}</p>

          <div className="d-flex flex-wrap gap-2 mt-4 pt-4 border-top-line">
            {post.tags.map((t) => (
              <span key={t} className="tag-pill">
                #{t}
              </span>
            ))}
          </div>
          <Comments />
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
      <section className="section-tight page-header">
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-7 fade-in">
              <div className="section-eyebrow">From the road</div>
              <h1 className="hero-title">Stories worth the read.</h1>
              <p className="mt-3 text-muted hero-subtitle hero-subtitle-narrow">
                Honest guides, slow-travel essays, and the things nobody puts in
                a brochure — written by our travelers and guides.
              </p>
            </div>
            <div className="col-lg-5 mt-4 mt-lg-0">
              <div className="position-relative">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="search"
                  className="form-control search-input"
                  placeholder="Search stories, places, tips…"
                  value={search}
                  onChange={handleSearchChange}
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

      <section className="section-tight">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-teal" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x fs-1 icon-muted"></i>
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
              <p className="text-muted mb-4 results-text">
                <strong>{posts.length}</strong>{' '}
                {posts.length === 1 ? 'story' : 'stories'}
                {debouncedSearch && (
                  <>
                    {' '}for{' '}
                    <strong>"{debouncedSearch}"</strong>
                  </>
                )}
              </p>

              {featured && !debouncedSearch && (
                <div className="mb-5">
                  <article className="dest-card post-card" onClick={() => setSelected(featured)}>
                    <div className="row g-0 featured-row">
                      <div className="col-md-6">
                        <div className="img-wrap featured-img-wrap">
                          <img src={featured.image} alt={featured.title} className="img-cover" />
                          <span className="badge-rating">{featured.category}</span>
                        </div>
                      </div>
                      <div className="col-md-6 d-flex flex-column justify-content-center featured-content">
                        <div className="editor-pick">Editor's pick</div>
                        <h2 className="featured-title">{featured.title}</h2>
                        <p className="mt-2 text-muted">{featured.excerpt}</p>
                        <div className="d-flex align-items-center gap-2 mt-3">
                          <img src={featured.authorAvatar} alt={featured.author} className="avatar-md" />
                          <span className="text-muted-sm">
                            {featured.author} · {featured.readTime} min read
                          </span>
                        </div>
                        <button type="button" className="btn btn-wd mt-4 align-self-start">
                          Read story <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              )}

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

      {selected && <PostModal post={selected} onClose={() => setSelected(null)} />}
    </>
  );
}