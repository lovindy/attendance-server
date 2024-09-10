// Express library
const express = require('express');

// Controllers
const teacherController = require('../controllers/teacherController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Define Express Router
const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

router.get('/', teacherController.getAllTeachers);

router.get('/me', userController.getMe, userController.getUser);

router
  .get('/:id', teacherController.getTeacher)
  .put('/:id', teacherController.updateTeacher)
  .delete('/:id', teacherController.deleteTeacher);

module.exports = router;
