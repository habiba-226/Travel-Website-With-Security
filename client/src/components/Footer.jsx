import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="wd-footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="brand-line">
              Wanderly<span style={{ color: 'var(--ochre)' }}>.</span>
            </div>
            <p className="mt-3" style={{ maxWidth: 320, fontSize: '0.95rem' }}>
              Curated journeys to extraordinary places, designed for travelers
              who want stories, not checklists.
            </p>
          </div>

          <div className="col-6 col-lg-2">
            <h5>Explore</h5>
            <Link to="/">Home</Link>
            <Link to="/destinations">Destinations</Link>
            <Link to="/tours">Tours & Packages</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/booking">Book a Trip</Link>
          </div>

          <div className="col-6 col-lg-3">
            <h5>Company</h5>
            <a href="#about">About</a>
            <a href="#careers">Careers</a>
            <a href="#press">Press</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="col-lg-3">
            <h5>Get in touch</h5>
            <a href="mailto:hello@wanderly.travel">hello@wanderly.travel</a>
            <a href="tel:+201234567890">+20 123 456 7890</a>
            <div className="mt-3 d-flex gap-3 fs-5">
              <a href="#instagram" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#twitter" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#facebook" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#youtube" aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <hr />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <span className="copyright">
            © {new Date().getFullYear()} Wanderly Travel Co. All rights reserved.
          </span>
          <span className="copyright">
            Made with <i className="bi bi-heart-fill" style={{ color: 'var(--ochre)' }}></i> for travelers.
          </span>
        </div>
      </div>
    </footer>
  );
}
