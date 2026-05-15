import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const initial = {
  fullName: '',
  email: '',
  phone: '',
  destination: '',
  travelDate: '',
  returnDate: '',
  travelers: 2,
  roomType: '',
  specialRequests: '',
};

export default function Booking() {
  const [params] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [serverError, setServerError] = useState('');

  // Load destinations into the dropdown
  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data) => setDestinations(data));
  }, []);

  // Pre-fill destination from query string (when coming from a destination card)
  useEffect(() => {
    const dest = params.get('destination');
    if (dest) setForm((f) => ({ ...f, destination: dest }));
  }, [params]);

  // ---------- Validation ----------
  const validateField = (name, value, all = form) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 3) return 'Full name must be at least 3 characters.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Please enter a valid email.';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required.';
        if (!/^[+\d][\d\s()-]{6,}$/.test(value))
          return 'Please enter a valid phone number.';
        return '';
      case 'destination':
        if (!value) return 'Please choose a destination.';
        return '';
      case 'travelDate': {
        if (!value) return 'Departure date is required.';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) < today) return 'Departure must be in the future.';
        return '';
      }
      case 'returnDate':
        if (!value) return 'Return date is required.';
        if (all.travelDate && new Date(value) <= new Date(all.travelDate))
          return 'Return must be after departure.';
        return '';
      case 'travelers':
        if (!value || Number(value) < 1) return 'At least 1 traveler is required.';
        if (Number(value) > 12) return 'Maximum 12 travelers per booking.';
        return '';
      case 'roomType':
        if (!value) return 'Please select a room type.';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const e = {};
    Object.keys(initial).forEach((k) => {
      if (k === 'specialRequests') return; // optional
      const msg = validateField(k, form[k], form);
      if (msg) e[k] = msg;
    });
    return e;
  };

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    // live-validate touched fields
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, next) }));
    }
    // re-validate returnDate when travelDate changes
    if (name === 'travelDate' && touched.returnDate) {
      setErrors((prev) => ({
        ...prev,
        returnDate: validateField('returnDate', next.returnDate, next),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const eMap = validateAll();
    setErrors(eMap);
    setTouched(
      Object.keys(initial).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    if (Object.keys(eMap).length > 0) {
      // Scroll to first error
      const first = Object.keys(eMap)[0];
      document.getElementsByName(first)[0]?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || 'Booking failed.');
      } else {
        setConfirmation(data.booking);
        setForm(initial);
        setTouched({});
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Confirmation screen ----------
  if (confirmation) {
    return (
      <section
        className="section"
        style={{ background: 'var(--sand)', minHeight: '70vh' }}
      >
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="wd-form text-center fade-in">
            <i
              className="bi bi-check-circle-fill"
              style={{ fontSize: '3.5rem', color: 'var(--teal-700)' }}
            ></i>
            <div className="section-eyebrow mt-3">Booking confirmed</div>
            <h2 className="mb-3">Your journey awaits, {confirmation.fullName.split(' ')[0]}.</h2>
            <p className="text-muted">
              We've sent a confirmation to <strong>{confirmation.email}</strong>.
              Our travel curator will be in touch within 24 hours.
            </p>

            <div
              className="my-4 p-4"
              style={{
                background: 'var(--cream)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
              }}
            >
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="text-muted" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Reference
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                    {confirmation.reference}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Destination
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                    {confirmation.destination}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Travel dates
                  </div>
                  <div>
                    {confirmation.travelDate} → {confirmation.returnDate}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Travelers
                  </div>
                  <div>
                    {confirmation.travelers} · {confirmation.roomType}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-wd"
              onClick={() => {
                setConfirmation(null);
              }}
            >
              Make another booking
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ---------- Booking form ----------
  return (
    <>
      <section
        className="section-tight"
        style={{ background: 'var(--sand)', paddingTop: '5rem', paddingBottom: '3rem' }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-8 fade-in">
              <div className="section-eyebrow">Plan your journey</div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                Tell us where you're going.
              </h1>
              <p className="mt-3 text-muted" style={{ maxWidth: 600 }}>
                Fill in the details below and a travel curator will design
                your itinerary, share pricing, and answer any questions
                within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container" style={{ maxWidth: 880 }}>
          {serverError && (
            <div className="alert-wd alert-error-wd mb-4">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {serverError}
            </div>
          )}

          <form className="wd-form" onSubmit={handleSubmit} noValidate>
            <div className="row g-4">
              {/* ----- Personal details ----- */}
              <div className="col-12">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                  Your details
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  So we know who's going.
                </p>
              </div>

              <div className="col-md-6">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  name="fullName"
                  className={'form-control' + (errors.fullName ? ' is-invalid' : '')}
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Habiba Hassan"
                  autoComplete="name"
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={'form-control' + (errors.email ? ' is-invalid' : '')}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className={'form-control' + (errors.phone ? ' is-invalid' : '')}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+20 100 123 4567"
                  autoComplete="tel"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Travelers</label>
                <input
                  type="number"
                  name="travelers"
                  min="1"
                  max="12"
                  className={'form-control' + (errors.travelers ? ' is-invalid' : '')}
                  value={form.travelers}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.travelers && <div className="invalid-feedback">{errors.travelers}</div>}
              </div>

              {/* ----- Trip details ----- */}
              <div className="col-12 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                  Trip details
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Where, when, and how.
                </p>
              </div>

              <div className="col-md-6">
                <label className="form-label">Destination</label>
                <select
                  name="destination"
                  className={'form-select' + (errors.destination ? ' is-invalid' : '')}
                  value={form.destination}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Choose a destination…</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}, {d.country}
                    </option>
                  ))}
                </select>
                {errors.destination && <div className="invalid-feedback">{errors.destination}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Room type</label>
                <select
                  name="roomType"
                  className={'form-select' + (errors.roomType ? ' is-invalid' : '')}
                  value={form.roomType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select room type…</option>
                  <option value="Single">Single occupancy</option>
                  <option value="Double">Double occupancy</option>
                  <option value="Family Suite">Family suite</option>
                  <option value="Luxury Villa">Luxury villa</option>
                </select>
                {errors.roomType && <div className="invalid-feedback">{errors.roomType}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Departure date</label>
                <input
                  type="date"
                  name="travelDate"
                  className={'form-control' + (errors.travelDate ? ' is-invalid' : '')}
                  value={form.travelDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.travelDate && <div className="invalid-feedback">{errors.travelDate}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Return date</label>
                <input
                  type="date"
                  name="returnDate"
                  className={'form-control' + (errors.returnDate ? ' is-invalid' : '')}
                  value={form.returnDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.returnDate && <div className="invalid-feedback">{errors.returnDate}</div>}
              </div>

              <div className="col-12">
                <label className="form-label">Special requests (optional)</label>
                <textarea
                  name="specialRequests"
                  className="form-control"
                  rows="4"
                  value={form.specialRequests}
                  onChange={handleChange}
                  placeholder="Dietary needs, accessibility, anniversary surprise…"
                ></textarea>
              </div>

              <div className="col-12 mt-2 d-flex flex-column flex-sm-row gap-3 align-items-sm-center justify-content-between">
                <small className="text-muted" style={{ maxWidth: 380 }}>
                  By submitting, you agree to be contacted by a Wanderly
                  travel curator. No payment is taken at this stage.
                </small>
                <button
                  type="submit"
                  className="btn btn-wd px-4"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting…
                    </>
                  ) : (
                    <>
                      Request booking <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
