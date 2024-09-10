const { Session } = require('../models');
const factory = require('./handlerFactory');

// Get one Session
exports.getSession = factory.getOne(Session, 'session_id');

// Get all Sessions
exports.getAllSessions = factory.getAll(Session);

// Add a new Session
exports.addSession = factory.createOne(Session);

// Update Session
exports.updateSession = factory.updateOne(Session, 'session_id');

// Delete Session
exports.deleteSession = factory.deleteOne(Session, 'session_id');
