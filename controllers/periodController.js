const { Period } = require('../models');
const factory = require('./handlerFactory');

// Get one Period
exports.getPeriod = factory.getOne(Period, 'period_id');

// Get all Periods
exports.getAllPeriods = factory.getAll(Period);

// Add a new Period
exports.addPeriod = factory.createOne(Period);

// Update Period
exports.updatePeriod = factory.updateOne(Period, 'period_id');

// Delete Period
exports.deletePeriod = factory.deleteOne(Period, 'period_id');
