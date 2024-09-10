// Express library
const express = require('express');

// Controllers
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin', 'teacher'));

// Student routes
router
  .route('/')
  .post(studentController.addStudent) // Create student with default attendance
  .get(studentController.getAllStudents);

router
  .route('/:id')
  .get(studentController.getStudent)
  .patch(studentController.updateStudent)
  .delete(studentController.deleteStudent);

module.exports = router;
