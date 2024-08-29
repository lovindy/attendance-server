const { User, Admin, Teacher, Student } = require('../models');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Add a new User with role-specific logic
exports.addUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, subject, class_id } = req.body;

  try {
    // Start a transaction to ensure both User and related role record are created together
    const newUser = await User.sequelize.transaction(async (t) => {
      // Create the user
      const createdUser = await User.create(
        { name, email, password, role },
        { transaction: t }
      );

      // Based on the role, create the corresponding record
      switch (role.toLowerCase()) {
        case 'teacher':
          await Teacher.create(
            { user_id: createdUser.user_id, subject },
            { transaction: t }
          );
          break;
        case 'student':
          await Student.create(
            { user_id: createdUser.user_id, class_id },
            { transaction: t }
          );
          break;
        case 'admin':
          await Admin.create(
            { user_id: createdUser.user_id },
            { transaction: t }
          );
          break;
        default:
          throw new AppError('Invalid role specified', 400);
      }

      return createdUser;
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.error('Error creating user:', err.message);
    console.error('Stack trace:', err.stack);
    return next(new AppError(`Failed to create user: ${err.message}`, 500));
  }
});

// Update User
exports.updateUser = factory.updateOne(User, 'user_id');

// Delete User
exports.deleteUser = factory.deleteOne(User, 'user_id');

// Middleware to get the current logged-in user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Get one User
exports.getUser = factory.getOne(User, 'user_id', [
  { model: Admin, as: 'AdminProfile' },
  { model: Teacher, as: 'TeacherProfile' },
  { model: Student, as: 'StudentProfile' },
]);

// Get all Users
exports.getAllUsers = factory.getAll(User, {}, [
  { model: Admin, as: 'AdminProfile' },
  { model: Teacher, as: 'TeacherProfile' },
  { model: Student, as: 'StudentProfile' },
]);
