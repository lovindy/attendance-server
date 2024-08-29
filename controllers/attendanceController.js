const { Student, Attendance, Class } = require('../models'); // Ensure models are correctly imported
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

// Get all students with attendance records
exports.getStudentsWithAttendance = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: Attendance,
          as: 'Attendances',
          include: [
            {
              model: Class, // Ensure associations are correct
              as: 'Class',
            },
          ],
        },
      ],
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students with attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Record attendance
exports.recordAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudentWithAttendance = catchAsync(async (req, res, next) => {
  const { student_id, name, class_id, user_id, Attendances } = req.body;

  // Update the student
  const updatedStudent = await Student.update(
    { name, class_id, user_id },
    { where: { student_id: req.params.id } }
  );

  if (!updatedStudent) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Update the related attendances
  for (const attendance of Attendances) {
    await Attendance.update(attendance, {
      where: { attendance_id: attendance.attendance_id },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      student: updatedStudent,
      attendances: Attendances,
    },
  });
});

// Add a new student
exports.addStudent = factory.createOne(Student);

// Delete student
exports.deleteStudent = factory.deleteOne(Student, 'student_id');

// Update attendance
exports.updateAttendance = factory.updateOne(Attendance, 'attendance_id');

// Delete attendance
exports.deleteAttendance = factory.deleteOne(Attendance, 'attendance_id');
