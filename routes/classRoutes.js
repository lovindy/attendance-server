// Frameworks
const express = require('express');

// Controllers
const classController = require('../controllers/classController');

// Define router for class routes
const router = express.Router();

// Class routes
router.get('/', classController.getAllClasses);
router.post('/', classController.addClass);
router.get('/:id', classController.getClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
