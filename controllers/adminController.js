const { Admin } = require('../models');
const factory = require('./handlerFactory');

// Get one admin
exports.getAdmin = factory.getOne(Admin, 'admin_id');

// Get all admins
exports.getAllAdmins = factory.getAll(Admin);

// Add a new admin
exports.addAdmin = factory.createOne(Admin);

// Update admin
exports.updateAdmin = factory.updateOne(Admin, 'admin_id');

// Delete admin
exports.deleteAdmin = factory.deleteOne(Admin, 'admin_id');
