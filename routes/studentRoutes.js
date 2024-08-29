const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router
  .route('/')
  .post(studentController.addStudent) // Create student with default attendance
  .get(studentController.getAllStudents);

router
  .route('/:id')
  .get(studentController.getStudent)
  .patch(studentController.updateStudent)
  .delete(studentController.deleteStudent);

module.exports = router;
