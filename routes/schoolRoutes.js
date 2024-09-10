// Express library
const express = require('express');

// Controllers
const schoolController = require('../controllers/schoolController');
const authController = require('../controllers/authController'); // Import authController

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

// School routes
router
  .get('/', schoolController.getAllSchools)
  .post('/', schoolController.createSchool);

router
  .put('/:id', schoolController.updateSchool)
  .get('/:id', schoolController.getSchool)
  .delete('/:id', schoolController.deleteSchool);

module.exports = router;
