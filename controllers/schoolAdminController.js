const {
  SchoolAdmin,
  Admin,
  School,
  Teacher,
  Student,
} = require('../models');
const factory = require('./handlerFactory');

// Get one school admin by ID with related Admin, School, Teachers, and Students
exports.getSchoolAdmin = factory.getOne(SchoolAdmin, 'school_admin_id', [
  { model: Admin, as: 'Admin' },
  { model: School, as: 'School' },
  { model: Teacher, as: 'Teachers' },
  { model: Student, as: 'Students' },
]);

// Get all school admins with associated data
exports.getAllSchoolAdmins = factory.getAll(SchoolAdmin, {}, [
  { model: Admin, as: 'Admin' },
  { model: School, as: 'School' },
  { model: Teacher, as: 'Teachers' },
  { model: Student, as: 'Students' },
]);

// Update school admin by ID
exports.updateSchoolAdmin = factory.updateOne(SchoolAdmin, 'school_admin_id');

// Delete school admin by ID
exports.deleteSchoolAdmin = factory.deleteOne(SchoolAdmin, 'school_admin_id');
