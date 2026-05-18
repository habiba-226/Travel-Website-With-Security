import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';   // ← add these
import { useAuth } from '../lib/AuthContext.jsx';

export default function Blog() {
  const { user } = useAuth();
  const location = useLocation();                               // ← read URL
  const navigate = useNavigate();

  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [openPost, setOpenPost]   = useState(null);
  const [comments, setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Reflected XSS ──────────────────────────────────────────────────────────
  // Pull `q` straight from the raw query string — no decoding, no sanitisation.
  // A crafted URL like /blog?q=<img src=x onerror=alert(1)> will execute.
  const rawQuery = new URLSearchParams(location.search).get('q') ?? '';
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/posts', { credentials: 'include' })
      .then(r => r.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const viewPost = async (post) => {
    setOpenPost(post);
    setNewComment('');
    const res = await fetch(`/api/posts/${post.id}/comments`, { credentials: 'include' });
    setComments(await res.json());
  };

  const refreshComments = async () => {
    const res = await fetch(`/api/posts/${openPost.id}/comments`, { credentials: 'include' });
    setComments(await res.json());
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    await fetch(`/api/posts/${openPost.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body: newComment }),
    });
    setNewComment('');
    await refreshComments();
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-5">

      {/* ── Reflected XSS sink ─────────────────────────────────────────────
          The search input writes `?q=` into the URL via navigate().
          On render, rawQuery is injected straight into innerHTML — no
          sanitisation.  Payload:  /blog?q=<img src=x onerror=alert(document.cookie)>
      ─────────────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: 420 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search posts…"
            defaultValue={rawQuery}
            onKeyDown={e => {
              if (e.key === 'Enter')
                navigate(`/blog?q=${e.target.value}`);   // raw value, no encode
            }}
          />
          <button
            className="btn btn-outline-primary"
            onClick={e => {
              const val = e.currentTarget.previousSibling.value;
              navigate(`/blog?q=${val}`);
            }}
          >Search</button>
        </div>

        {rawQuery && (
          <p className="mt-2 text-muted small">
            Showing results for:{' '}
            {/*
              VULNERABILITY (Reflected XSS):
              rawQuery comes directly from location.search and is injected into
              innerHTML without any encoding or sanitisation.
              Proof-of-concept: /blog?q=<img src=x onerror=alert(document.cookie)>
            */}
            <span dangerouslySetInnerHTML={{ __html: rawQuery }} />
          </p>
        )}
      </div>
      {/* ─────────────────────────────────────────────────────────────────── */}

      {!openPost ? (
        <>
          <h1 className="fw-bold mb-1">Travel Blog</h1>
          <p className="text-muted mb-5">Stories worth the read</p>

          <div className="row g-4">
            {posts
              .filter(p =>
                !rawQuery ||
                p.title.toLowerCase().includes(rawQuery.toLowerCase()) ||
                p.excerpt?.toLowerCase().includes(rawQuery.toLowerCase())
              )
              .map(post => (
                <div key={post.id} className="col-md-4">
                  <div
                    className="card h-100 shadow-sm border-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => viewPost(post)}
                  >
                    <img
                      src={post.image}
                      className="card-img-top"
                      alt={post.title}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-bold">{post.title}</h5>
                      <p className="card-text text-muted flex-grow-1">{post.excerpt}</p>
                      <small className="text-muted mt-2">
                        <i className="bi bi-person me-1" />{post.author}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <>
          <button
            className="btn btn-outline-secondary mb-4"
            onClick={() => { setOpenPost(null); setComments([]); }}
          >
            <i className="bi bi-arrow-left me-2" />Back to Blog
          </button>

          <img
            src={openPost.image}
            alt={openPost.title}
            className="img-fluid rounded mb-4 w-100"
            style={{ maxHeight: 380, objectFit: 'cover' }}
          />

          <h1 className="fw-bold">{openPost.title}</h1>
          <p className="text-muted mb-4">
            <i className="bi bi-person me-1" />{openPost.author}
          </p>
          <hr />
          <p className="lead">{openPost.body}</p>

          <hr className="my-4" />
          <h4 className="fw-bold mb-4">
            <i className="bi bi-chat-left-text me-2" />Comments
          </h4>

          {comments.length === 0 && (
            <p className="text-muted">No comments yet. Be the first!</p>
          )}

          {comments.map(c => (
            <div key={c.id} className="card mb-3 border-0 bg-light">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <strong>{c.username}</strong>
                  <small className="text-muted">{new Date(c.created_at).toLocaleDateString()}</small>
                </div>
                {/* VULNERABILITY (Stored XSS): raw HTML from DB */}
                <div dangerouslySetInnerHTML={{ __html: c.body }} />
              </div>
            </div>
          ))}

          <form onSubmit={submitComment} className="mt-4">
            <div className="mb-3">
              <label className="form-label fw-bold">Leave a comment</label>
              <textarea
                className="form-control"
                rows={3}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                required
              />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <><span className="spinner-border spinner-border-sm me-2" />Posting...</>
            ) : 'Post Comment'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}