const { Subject } = require('../models');
const factory = require('./handlerFactory');

// Get one Subject
exports.getSubject = factory.getOne(Subject, 'subject_id');

// Get all Subjects
exports.getAllSubjects = factory.getAll(Subject);

// Add a new Subject
exports.addSubject = factory.createOne(Subject);

// Update Subject
exports.updateSubject = factory.updateOne(Subject, 'subject_id');

// Delete Subject
exports.deleteSubject = factory.deleteOne(Subject, 'subject_id');
