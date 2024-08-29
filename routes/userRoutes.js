const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/auth');

const router = express.Router();

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

// Get Current User
router.get('/me', userController.getMe, userController.getUser);

// User routes (protected and restricted to 'admin' only)
router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers)
  .post(authController.restrictTo('admin'), userController.addUser);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getUser)
  .put(authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
