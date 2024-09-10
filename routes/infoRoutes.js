// Express library
const express = require('express');

// Controllers
const infoController = require('../controllers/infoController');
const authController = require('../controllers/authController');

// Define Express Router
const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict all routes to admin only
router.use(authController.restrictTo('admin'));

// Info routes
router.get('/', infoController.getAllInfos).post('/', infoController.addInfo);

router
  .get('/:id', infoController.getInfo)
  .put('/:id', infoController.updateInfo)
  .delete('/:id', infoController.deleteInfo);

module.exports = router;
