// backend/routes/users.js
const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({ message: 'Users API endpoint' });
});

module.exports = router;