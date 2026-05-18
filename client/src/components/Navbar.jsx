import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMenu = () => {
    const el = document.getElementById('mainNav');
    if (el?.classList.contains('show')) el.classList.remove('show');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/" onClick={closeMenu}>
          <i className="bi bi-airplane-fill me-2" />
          Wanderly
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          {user ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard" end onClick={closeMenu}>Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/destinations" onClick={closeMenu}>Destinations</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/blog" onClick={closeMenu}>Blog</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/promo" onClick={closeMenu}>
                  Promo
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile" onClick={closeMenu}>Profile</NavLink>
                </li>
              </ul>

              <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
                <span className="text-white-50 small">
                  {user.username}
                  {user.role === 'admin' && (
                    <span className="badge bg-warning text-dark ms-2">Admin</span>
                  )}
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">Login</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/signup">Sign Up</NavLink>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}