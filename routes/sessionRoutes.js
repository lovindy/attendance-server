// Express library
const express = require('express');

// Controllers
const sessionController = require('../controllers/sessionController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Session routes for admin and teacher
router
  .get('/', sessionController.getAllSessions)
  .post('/', sessionController.addSession);
router.get('/:id', sessionController.getSession);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

router
  .put('/:id', sessionController.updateSession)
  .delete('/:id', sessionController.deleteSession);

module.exports = router;
