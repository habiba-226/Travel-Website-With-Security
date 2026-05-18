import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const res = await fetch('/api/users', { credentials: 'include' });
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    if (user?.role === 'admin') loadUsers();
  }, [user]);

  // VULNERABILITY: no CSRF token on this request — CSRF via XSS can call this endpoint
  const promoteUser = async (userId) => {
    setMessage('');
    setError('');
    const res = await fetch(`/api/promote/${userId}`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      await loadUsers();
      // Refresh current user in case they promoted themselves
      const meRes = await fetch('/api/me', { credentials: 'include' });
      if (meRes.ok) setUser(await meRes.json());
    } else {
      setError(data.error);
    }
  };

  const initials = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">

          {/* User card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3 flex-shrink-0"
                  style={{ width: 64, height: 64 }}
                >
                  {initials}
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-0 fw-bold">{user?.username}</h4>
                  <p className="text-muted mb-0">{user?.email}</p>
                </div>
                <span className={`badge fs-6 ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                  {user?.role}
                </span>
              </div>

              <div className="row g-3">
                <div className="col-sm-4">
                  <p className="text-muted small mb-1">User ID</p>
                  <p className="fw-semibold mb-0">{user?.id}</p>
                </div>
                <div className="col-sm-4">
                  <p className="text-muted small mb-1">Username</p>
                  <p className="fw-semibold mb-0">{user?.username}</p>
                </div>
                <div className="col-sm-4">
                  <p className="text-muted small mb-1">Role</p>
                  <p className="fw-semibold mb-0">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regular user hint for the cyber demo */}
          {/* {user?.role !== 'admin' && (
            <div className="alert alert-info d-flex gap-2">
              <i className="bi bi-info-circle-fill flex-shrink-0 mt-1" />
              <div>
                <strong>Security demo note:</strong> Your User ID is <strong>{user?.id}</strong>.
                This ID is used in the privilege escalation attack — an attacker who crafts the CSRF
                payload with this ID can promote you (or themselves) to Admin.
              </div>
            </div>
          )} */}

          {/* Admin panel */}
          {user?.role === 'admin' && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-shield-lock me-2 text-warning" />
                  Admin Panel — User Management
                </h5>

                {message && <div className="alert alert-success py-2">{message}</div>}
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="text-muted">{u.id}</td>
                          <td className="fw-semibold">{u.username}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.role !== 'admin' ? (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => promoteUser(u.id)}
                              >
                                Promote to Admin
                              </button>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}