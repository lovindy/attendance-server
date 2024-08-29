const { Teacher } = require('../models');
const factory = require('./handlerFactory');

// Get one teacher
exports.getTeacher = factory.getOne(Teacher, 'teacher_id');

// Get all teachers
exports.getAllTeachers = factory.getAll(Teacher);

// Add a new teacher
exports.addTeacher = factory.createOne(Teacher);

// Update teacher
exports.updateTeacher = factory.updateOne(Teacher, 'teacher_id');

// Delete teacher
exports.deleteTeacher = factory.deleteOne(Teacher, 'teacher_id');
