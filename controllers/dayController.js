const { DayOfWeek } = require('../models');
const factory = require('./handlerFactory');

// Get one DayOfWeek
exports.getDayOfWeek = factory.getOne(DayOfWeek, 'day_id');

// Get all DayOfWeeks
exports.getAllDayOfWeeks = factory.getAll(DayOfWeek);

// Add a new DayOfWeek
exports.addDayOfWeek = factory.createOne(DayOfWeek);

// Update DayOfWeek
exports.updateDayOfWeek = factory.updateOne(DayOfWeek, 'day_id');

// Delete DayOfWeek
exports.deleteDayOfWeek = factory.deleteOne(DayOfWeek, 'day_id');
