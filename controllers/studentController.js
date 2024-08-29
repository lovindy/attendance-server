const { Student, Attendance, Class } = require('../models');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Add a new student and create default attendance
exports.addStudent = catchAsync(async (req, res, next) => {
  const { name, class_id, user_id } = req.body;

  // Check if the class exists
  const classExists = await Class.findByPk(class_id);
  if (!classExists) {
    return next(new AppError('Class not found', 404));
  }

  // Create the student and assign it to the class
  const student = await Student.create({
    name,
    class_id,
    user_id,
  });

  // Create a default attendance record with 'absent' status
  await Attendance.create({
    date: new Date(), // Set the current date
    status: 'absent', // Default status is 'absent'
    student_id: student.student_id, // Associate the attendance with the student
    class_id: class_id, // Associate the attendance with the class
  });

  res.status(201).json({
    status: 'success',
    data: {
      student,
    },
  });
});

// Get Student By ID
exports.getStudent = factory.getOne(Student, 'student_id');

// Get all students with their attendance records
exports.getAllStudents = factory.getAll(Student);

// Update student details and their attendance records
exports.updateStudent = factory.updateOne(Student, 'student_id');

// Delete student and their attendance records
exports.deleteStudent = factory.deleteOne(Student, 'student_id');
