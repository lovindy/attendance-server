const { Student, Attendance, Class } = require('../models'); // Ensure models are correctly imported
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all students with attendance records
exports.getStudentsWithAttendance = factory.getAll(Student, {}, [
  {
    model: Attendance,
    as: 'Attendances',
    include: [
      {
        model: Class,
        as: 'Class',
      },
    ],
  },
]);

// Record attendance
exports.recordAttendance = factory.createOne(Attendance, [
  {
    model: Class, // Example if Attendance also has Class associations (optional)
    as: 'Class',
  },
]);

// Update a student with attendance
exports.updateStudentWithAttendance = catchAsync(async (req, res, next) => {
  const { Attendances, ...studentData } = req.body;

  // Update the student
  const [affectedRows] = await Student.update(studentData, {
    where: { student_id: req.params.id },
  });

  if (affectedRows === 0) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Update the related attendances
  if (Attendances && Attendances.length > 0) {
    for (const attendance of Attendances) {
      await Attendance.update(attendance, {
        where: { attendance_id: attendance.attendance_id },
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Student and attendance records updated successfully',
  });
});

// Update attendance
exports.updateAttendance = factory.updateOne(Attendance, 'attendance_id');

// Delete attendance
exports.deleteAttendance = factory.deleteOne(Attendance, 'attendance_id');
