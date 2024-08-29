const express = require('express');
const teacherController = require('../controllers/teacherController');

const router = express.Router();

router.get('/', teacherController.getAllTeachers);
router.post('/', teacherController.addTeacher);
router.get('/:id', teacherController.getTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
