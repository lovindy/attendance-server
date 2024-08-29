const { School, SchoolAdmin } = require('../models');
const factory = require('./handlerFactory');

// Get one school
exports.getSchool = factory.getOne(School, 'school_id');

// Get all schools
exports.getAllSchools = factory.getAll(School);

// Add a new school
// exports.addSchool = factory.createOne(School);

// Function to create a school and link it to an admin
exports.createSchool = async (req, res) => {
  try {
    const school = await School.create(req.body);
    const schoolAdmin = await SchoolAdmin.create({
      school_id: school.id,
      admin_id: req.body.admin_id, // Pass this from the request
      role: req.body.role || 'Principal',
      assigned_date: new Date(),
    });
    res.status(201).json({ school, schoolAdmin });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update school
exports.updateSchool = factory.updateOne(School, 'school_id');

// Delete school
exports.deleteSchool = factory.deleteOne(School, 'school_id');
