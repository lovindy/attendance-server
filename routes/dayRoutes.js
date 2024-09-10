// Express library
const express = require('express');

// Controllers
const dayController = require('../controllers/dayController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

// DayOfWeek routes
router
  .get('/', dayController.getAllDayOfWeeks)
  .post('/', dayController.addDayOfWeek);

router
  .get('/:id', dayController.getDayOfWeek)
  .put('/:id', dayController.updateDayOfWeek)
  .delete('/:id', dayController.deleteDayOfWeek);

module.exports = router;
