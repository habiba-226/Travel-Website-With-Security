import { useState, useEffect } from 'react';

export default function Promo() {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');

  const loadComments = async () => {
    console.log("Loading comments with CSRF token:", csrfToken); // add this
    const res = await fetch('/api/comments', {
      credentials: 'include', 
       headers: {
    "Content-Type": "application/json",
    "x-xsrf-token": csrfToken,
  },
    });

    if (res.ok) {
      setComments(await res.json());
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const addComment = async (e) => {
    e.preventDefault();

    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: input })
    });

    setInput('');
    loadComments();
  };

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">Community Promotions</h1>

      {/* input */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={addComment}>
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Share a promotion..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button className="btn btn-primary">
              Post Comment
            </button>
          </form>
        </div>
      </div>

      {/* comments */}
      <div className="d-flex flex-column gap-3">
        {comments.map((c) => (
          <div key={c.id} className="card shadow-sm border-0">
            <div className="card-body">

              {/* ⚠️ STORED XSS VULNERABILITY */}
              <div dangerouslySetInnerHTML={{ __html: c.content }} />

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}