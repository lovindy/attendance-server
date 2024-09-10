// Express library
const express = require('express');

// Controllers
const attendanceController = require('../controllers/attendanceController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin', 'teacher'));

// Attendance routes
router
  .get('/', attendanceController.getStudentsWithAttendance)
  .post('/', attendanceController.recordAttendance);

// Student Attendance routes
router.put('/students/:id', attendanceController.updateStudentWithAttendance);

// Update and Delete routes
router
  .put('/:id', attendanceController.updateAttendance)
  .delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
