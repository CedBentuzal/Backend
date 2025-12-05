// backend/routes/adminBookingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// ================================
// GET ALL BOOKINGS (ADMIN PANEL)
// ================================
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let q = db.collection('bookings').orderBy('createdAt', 'desc');
    if (status) q = q.where('status', '==', status.toLowerCase());

    const snap = await q.get();

    const results = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

    return res.json(results);
  } catch (err) {
    console.error('Admin get bookings error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ================================
// GET Booking By ID
// ================================
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Booking not found" });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Admin get booking error', err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ================================
// UPDATE BOOKING STATUS (Pending -> Completed, Cancelled)
// ================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db.collection('bookings').doc(req.params.id).update({
      status: status.toLowerCase(),
      updatedAt: new Date().toISOString()
    });

    return res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error('Admin status update error', err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ================================
// DELETE BOOKING
// ================================
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('bookings').doc(req.params.id).delete();
    return res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    console.error('Admin delete error', err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ================================
// GET ALL BOOKED DATES (for admin calendar)
// ================================
router.get('/meta/dates/all', async (req, res) => {
  try {
    const snap = await db.collection('bookings').get();
    const set = new Set();

    snap.forEach(doc => {
      const d = doc.data().selectedDate;
      if (d) set.add(d);
    });

    return res.json(Array.from(set));
  } catch (err) {
    console.error("Admin get dates error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ================================
// GET BOOKED TIME SLOTS FOR SPECIFIC DAY
// ================================
router.get('/meta/time-slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date required" });

    const snap = await db.collection('bookings')
      .where('selectedDate', '==', date)
      .get();

    const slots = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (d.selectedTime) slots.push(d.selectedTime);
    });

    return res.json(slots);
  } catch (err) {
    console.error('Admin get time slots error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
