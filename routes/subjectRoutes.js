const express = require('express');
const subjectController = require('../controllers/subjectController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

// Subject routes
router
  .get('/', subjectController.getAllSubjects)
  .post('/', subjectController.addSubject);

router
  .get('/:id', subjectController.getSubject)
  .put('/:id', subjectController.updateSubject)
  .delete('/:id', subjectController.deleteSubject);

module.exports = router;
