const express = require('express');
// const userController = require('./controllers/userController');
const schoolController = require('../controllers/schoolController');

const router = express.Router();

// router.post('/api/users', userController.createAdminUser);
router.get('/', schoolController.getAllSchools);
router.get('/:id', schoolController.getSchool);
router.put('/:id', schoolController.updateSchool);
router.delete('/:id', schoolController.deleteSchool);

// Create a new school and link it to an admin
router.post('/', schoolController.createSchool);

module.exports = router;
