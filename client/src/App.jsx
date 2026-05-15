import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Destinations from './pages/Destinations.jsx';
import Booking from './pages/Booking.jsx';
import Tours from './pages/Tours.jsx';
import Gallery from './pages/Gallery.jsx';
import Blog from './pages/Blog.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/tours"        element={<Tours />} />
          <Route path="/gallery"      element={<Gallery />} />
          <Route path="/blog"         element={<Blog />} />
          <Route path="/booking"      element={<Booking />} />
          <Route path="*"             element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
