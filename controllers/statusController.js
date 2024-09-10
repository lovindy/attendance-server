const { Status } = require('../models');
const factory = require('./handlerFactory');

// Get one Status
exports.getStatus = factory.getOne(Status, 'status_id');

// Get all Statuss
exports.getAllStatuss = factory.getAll(Status);

// Add a new Status
exports.addStatus = factory.createOne(Status);

// Update Status
exports.updateStatus = factory.updateOne(Status, 'status_id');

// Delete Status
exports.deleteStatus = factory.deleteOne(Status, 'status_id');
