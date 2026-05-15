import { NavLink, Link, useLocation } from 'react-router-dom';

const EXPLORE_LINKS = [
  { to: '/destinations', label: 'Destinations', icon: 'bi-compass' },
  { to: '/tours',        label: 'Tours & Packages', icon: 'bi-map' },
  { to: '/gallery',      label: 'Gallery', icon: 'bi-images' },
  { to: '/blog',         label: 'Blog', icon: 'bi-journal-text' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const exploreActive = EXPLORE_LINKS.some((l) => pathname.startsWith(l.to));

  return (
    <nav className="wd-nav navbar navbar-expand-lg">
      <div className="container">
        <Link to="/" className="wd-brand navbar-brand">
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
              <NavLink to="/" className="nav-link" end>
                Home
              </NavLink>
            </li>

            {/* Explore dropdown — desktop */}
            <li className="nav-item dropdown d-none d-lg-block">
              <button
                className={'nav-link dropdown-toggle border-0 bg-transparent' + (exploreActive ? ' active' : '')}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ fontWeight: 500, fontSize: '0.97rem', margin: '0 0.6rem', padding: '0.4rem 0.2rem' }}
              >
                Explore
              </button>
              <ul className="dropdown-menu shadow border-0" style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: 220 }}>
                {EXPLORE_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="dropdown-item d-flex align-items-center gap-2"
                      style={{ borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.85rem', fontWeight: 500 }}
                    >
                      <i className={`bi ${l.icon}`} style={{ color: 'var(--teal-700)', width: 18 }}></i>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Flat links on mobile */}
            {EXPLORE_LINKS.map((l) => (
              <li className="nav-item d-lg-none" key={l.to}>
                <NavLink to={l.to} className="nav-link">{l.label}</NavLink>
              </li>
            ))}

            <li className="nav-item">
              <NavLink to="/booking" className="nav-link">
                Book a Trip
              </NavLink>
            </li>
            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              <Link to="/booking" className="btn btn-wd">
                Plan your journey
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
