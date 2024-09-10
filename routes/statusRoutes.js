// Express library
const express = require('express');

// Controllers
const statusController = require('../controllers/statusController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin', 'teacher'));

// status routes
router
  .get('/', statusController.getAllStatuss)
  .post('/', statusController.addStatus);

router
  .get('/:id', statusController.getStatus)
  .put('/:id', statusController.updateStatus)
  .delete('/:id', statusController.deleteStatus);

module.exports = router;
