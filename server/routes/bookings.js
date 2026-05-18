// routes/bookings.js
import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s) => /^[+\d][\d\s()-]{6,}$/.test(s);

// POST /api/bookings — create new booking
router.post('/', async (req, res) => {
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

  try {
    const booking = await prisma.booking.create({
      data: {
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
      },
    });

    res.status(201).json({
      message: 'Booking confirmed! We will contact you shortly.',
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// GET /api/bookings — list all bookings
router.get('/', async (_req, res) => {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(bookings);
});

export default router;
