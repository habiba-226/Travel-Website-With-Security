import '../styles/Global.css';
import '../styles/Navbar.css';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

const EXPLORE_LINKS = [
  { to: '/destinations', label: 'Destinations', icon: 'bi-compass' },
  { to: '/tours', label: 'Tours & Packages', icon: 'bi-map' },
  { to: '/gallery', label: 'Gallery', icon: 'bi-images' },
  { to: '/blog', label: 'Blog', icon: 'bi-journal-text' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const exploreActive = EXPLORE_LINKS.some((l) => pathname.startsWith(l.to));

  // Forces dropdowns and mobile menus to close on route change
  const handleNavigate = () => {
    // 1. Close mobile collapse menu if open
    const mobileNav = document.getElementById('mainNav');
    if (mobileNav && mobileNav.classList.contains('show')) {
      mobileNav.classList.remove('show');
    }
    // 2. Close Bootstrap dropdown — remove 'show' from toggle button and menu
    document.querySelectorAll('.dropdown-menu.show').forEach((menu) => {
      menu.classList.remove('show');
    });
    document.querySelectorAll('[data-bs-toggle="dropdown"].show').forEach((btn) => {
      btn.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
    });
    // 3. Also blur any focused element as fallback
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  async function handleLogout() {
    await logout();
    navigate('/login');
  }
  return (
    <nav className="wd-nav navbar navbar-expand-lg">
      <div className="container">
        <Link to="/" className="wd-brand navbar-brand" onClick={handleNavigate}>
          <span className="dot" />
          Wanderly
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-3"></i>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end onClick={handleNavigate}>
                Home
              </NavLink>
            </li>

            {/* Explore dropdown — desktop */}
            <li className="nav-item dropdown d-none d-lg-block">
              <button
                className={`nav-link dropdown-toggle border-0 bg-transparent nav-explore-btn ${exploreActive ? 'active' : ''}`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Explore
              </button>
              <ul className="dropdown-menu shadow border-0 explore-dropdown-menu">
                {EXPLORE_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="dropdown-item d-flex align-items-center gap-2 explore-dropdown-item"
                      onClick={handleNavigate}
                    >
                      <i className={`bi ${l.icon} explore-dropdown-icon`}></i>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Flat links on mobile */}
            {EXPLORE_LINKS.map((l) => (
              <li className="nav-item d-lg-none" key={l.to}>
                <NavLink to={l.to} className="nav-link" onClick={handleNavigate}>
                  {l.label}
                </NavLink>
              </li>
            ))}

            {/* Single CTA Button (Removed the duplicate text link) */}
            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              <Link to="/booking" className="btn btn-wd" onClick={handleNavigate}>
                Plan your journey
              </Link>
            </li>


            {user && (
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button onClick={handleLogout} className="btn btn-wd-outline">
                  Sign out
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}