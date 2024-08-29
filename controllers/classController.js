const { Class } = require('../models');
const factory = require('./handlerFactory');

// Get one class
exports.getClass = factory.getOne(Class, 'class_id');

// Get all classes
exports.getAllClasses = factory.getAll(Class);

// Add a new class
exports.addClass = factory.createOne(Class);

// Update class
exports.updateClass = factory.updateOne(Class, 'class_id');

// Delete class
exports.deleteClass = factory.deleteOne(Class, 'class_id');
