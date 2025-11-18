// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /api/bookings  -> create booking (from website)
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // basic validation - adjust field names to match your frontend CreateBookingRequest
    const required = ['fullName','email','contactNumber','eventType','selectedDate','selectedTime'];
    for (const k of required) {
      if (!data[k]) return res.status(400).json({ error: `Missing ${k}` });
    }

    // Normalise date/time fields as strings (frontend uses ISO date)
    const doc = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('bookings').add(doc);

    return res.status(201).json({ success: true, id: docRef.id, ...doc });
  } catch (err) {
    console.error('create booking error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookings  -> list bookings (supports ?email= or ?date= or ?status=)
router.get('/', async (req, res) => {
  try {
    const { email, date, status } = req.query;
    let q = db.collection('bookings').orderBy('createdAt', 'desc');

    if (email) q = q.where('email', '==', email);
    if (status) q = q.where('status', '==', status);
    // date should match selectedDate field exact e.g. 2025-12-12
    if (date) q = q.where('selectedDate', '==', date);

    const snap = await q.get();
    const results = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
    return res.json(results);
  } catch (err) {
    console.error('get bookings error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('bookings').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('get booking by id error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookings/dates -> returns array of booked dates (strings), include pending/confirmed
router.get('/meta/dates', async (req, res) => {
  try {
    const snap = await db.collection('bookings').get();
    const set = new Set();
    snap.forEach(doc => {
      const d = doc.data().selectedDate;
      if (d) set.add(d);
    });
    return res.json(Array.from(set));
  } catch (err) {
    console.error('get booked dates', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookings/time-slots?date=YYYY-MM-DD -> returns array of booked time strings
router.get('/meta/time-slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date required' });

    const snap = await db.collection('bookings').where('selectedDate', '==', date).get();
    const slots = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (d.selectedTime) slots.push(d.selectedTime);
    });
    return res.json(slots);
  } catch (err) {
    console.error('get time slots', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bookings/upcoming?days=7
router.get('/upcoming', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);

    const snap = await db.collection('bookings').get();
    const list = [];
    snap.forEach(doc => {
      const d = doc.data();
      const sd = new Date(d.selectedDate);
      if (d.status !== 'cancelled' && sd >= today && sd <= future) list.push({ id: doc.id, ...d });
    });
    return res.json(list);
  } catch (err) {
    console.error('upcoming', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
