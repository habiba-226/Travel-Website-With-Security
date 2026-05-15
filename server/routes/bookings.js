// routes/bookings.js
import express from "express";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// In-memory storage for bookings (would be a database in production)
const bookings = [];

// Server-side validation helpers
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s) => /^[+\d][\d\s()-]{6,}$/.test(s);

// POST /api/bookings — create new booking
router.post('/', requireAuth ,(req, res) => {
  const {
    fullName,
    email,
    phone,
    destination,
    travelDate,
    returnDate,
    travelers,
    roomType,
    specialRequests,
  } = req.body || {};

  // ----- Validation -----
  const errors = {};
  if (!fullName || fullName.trim().length < 3)
    errors.fullName = 'Full name must be at least 3 characters';
  if (!email || !isEmail(email))
    errors.email = 'A valid email address is required';
  if (!phone || !isPhone(phone))
    errors.phone = 'A valid phone number is required';
  if (!destination) errors.destination = 'Please choose a destination';
  if (!travelDate) errors.travelDate = 'Departure date is required';
  if (!returnDate) errors.returnDate = 'Return date is required';
  if (travelDate && returnDate && new Date(returnDate) <= new Date(travelDate))
    errors.returnDate = 'Return date must be after the departure date';
  if (!travelers || Number(travelers) < 1 || Number(travelers) > 12)
    errors.travelers = 'Travelers must be between 1 and 12';
  if (!roomType) errors.roomType = 'Please select a room type';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors });
  }

  // ----- Save -----
  const booking = {
    id: bookings.length + 1,
    reference: 'WND-' + Date.now().toString(36).toUpperCase(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    destination,
    travelDate,
    returnDate,
    travelers: Number(travelers),
    roomType,
    specialRequests: specialRequests ? specialRequests.trim() : '',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);

  res.status(201).json({
    message: 'Booking confirmed! We will contact you shortly.',
    booking,
  });
});

// GET /api/bookings — list bookings (handy for testing/admin)
router.get('/', requireAuth, (_req, res) => {
  res.json(bookings);
});

export default router;
