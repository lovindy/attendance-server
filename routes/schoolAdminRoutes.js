const express = require('express');
const schoolAdminController = require('../controllers/schoolAdminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

// School admin routes
router.get('/', schoolAdminController.getAllSchoolAdmins);

router
  .get('/:id', schoolAdminController.getSchoolAdmin)
  .put('/:id', schoolAdminController.updateSchoolAdmin)
  .delete('/:id', schoolAdminController.deleteSchoolAdmin);

module.exports = router;
