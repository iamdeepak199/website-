const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/dashboard', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }

  // Render the dashboard and pass the user data
  res.render('dashboard', { user: req.session.user });
});

module.exports = router;
