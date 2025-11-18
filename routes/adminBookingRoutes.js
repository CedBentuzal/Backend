const express = require('express');
const router = express.Router();

// Example admin route
router.get('/', (req, res) => {
  res.json({ message: 'Admin booking routes placeholder' });
});

module.exports = router;

//placeholder file for admin booking routes 