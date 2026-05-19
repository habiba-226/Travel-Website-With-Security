import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';
import { getCSRFTokenFromCookie } from '../lib/api.js';

export default function Blog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPost, setOpenPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const csrfToken = getCSRFTokenFromCookie();
  console.log("CSRF token in Blog component:", csrfToken);

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
      headers: {
        'Content-Type': 'application/json',
        "x-xsrf-token": csrfToken,
      },
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
      {!openPost ? (
        <>
          <h1 className="fw-bold mb-1">Travel Blog</h1>
          <p className="text-muted mb-5">Stories worth the read</p>

          <div className="row g-4">
            {posts.map(post => (
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
            onClick={() => setOpenPost(null)}
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

          {/* Comments section */}
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
                <div className="comment-body">
                  {c.body}
                </div>
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