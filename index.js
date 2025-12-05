const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/BookingRoutes.js');
const adminBookingRoutes = require('./routes/adminBookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

// Public website endpoints
app.use('/api/bookings', bookingRoutes);

// Admin endpoints (desktop app)
app.use('/api/admin/bookings', adminBookingRoutes);

app.use("/api/admin/bookings", require("./routes/adminBookingRoutes"));


// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
