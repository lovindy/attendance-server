// Express library
const express = require('express');

// Authentication and User Controller
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// File upload and resizing Controller
const fileController = require('../controllers/fileController');

// Teacher and Student Controller
const teacherController = require('../controllers/teacherController');
const studentController = require('../controllers/studentController');

// Define Express Router
const router = express.Router();

// Signup and Login routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Email verification route
router.get('/verifyEmail/:token', authController.verifyEmail);

// Teacher verify email
router.get('/verifyEmail/teacher/:token', teacherController.verifyTeacherEmail);

// Should be enable after email get verified
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all route after this middleware
router.use(authController.protect);

// Require email verification for the following route
router.use(authController.requireEmailVerification);

// Get current user
router.get('/me', userController.getMe, userController.getUser);

router.post('/logout', authController.logout);

// Update current user details
router.patch(
  '/updateMe',
  fileController.uploadUserPhoto,
  fileController.resizeUserPhoto,
  userController.updateMe
);

// Admin route
router.use(authController.restrictTo('admin'));

// Teacher signup route
router.post('/signup/teacher', teacherController.signupTeacher);

// Student route
router.post('/', studentController.addStudent);

// Password management route for admin
router.patch('/updatePassword', authController.updatePassword);

// User management routes
router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser, userController.getMe)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
