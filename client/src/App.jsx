import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Destinations from './pages/Destinations.jsx';
import Booking from './pages/Booking.jsx';
import Tours from './pages/Tours.jsx';
import Gallery from './pages/Gallery.jsx';
import Blog from './pages/Blog.jsx';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './pages/Login.jsx';
import { SignupPage } from './pages/Signup.jsx';
import { AuthProvider } from './lib/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Navigate } from 'react-router-dom';

export default function App() {
  return (
      <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
               <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/destinations"
            element={
              <ProtectedRoute>
               <Destinations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tours"
            element={
              <ProtectedRoute>
               <Tours />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
               <Gallery />
              </ProtectedRoute>
            }
          />

            <Route
            path="/blog"
            element={
              <ProtectedRoute>
                <Blog />
              </ProtectedRoute>

            }
          />

            
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>

            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
