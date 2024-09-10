// Express library
const express = require('express');

// Controllers
const classController = require('../controllers/classController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Class routes for admin and teacher
router.get('/', classController.getAllClasses);

router.get('/:id', classController.getClass);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

router.post('/', classController.addClass);

router
  .put('/:id', classController.updateClass)
  .delete('/:id', classController.deleteClass);

module.exports = router;
