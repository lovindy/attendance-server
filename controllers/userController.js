const { User, Admin, Teacher, Student, Info } = require('../models');
const { filterObj } = require('../utils/filterObj');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Middleware to get the current logged-in user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.user_id;
  next();
};

// Update current user details (excluding password)
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400
      )
    );
  }

  // 2) Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user record
  const [numAffectedRows, updatedUser] = await User.update(filteredBody, {
    where: { user_id: req.user.id },
    returning: true,
    plain: true,
  });

  if (numAffectedRows === 0) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Soft delete current user (set active to false)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.update(
    { active: false },
    {
      where: { user_id: req.user.id },
    }
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get one User
exports.getUser = factory.getOne(User, 'user_id', [
  {
    model: Admin,
    as: 'AdminProfile',
    include: [{ model: Info, as: 'Info' }],
  },
]);

// Get all Users
exports.getAllUsers = factory.getAll(User, {}, [
  {
    model: Admin,
    as: 'AdminProfile',
    include: [{ model: Info, as: 'Info' }],
  },
  {
    model: Teacher,
    as: 'TeacherProfile',
    include: [{ model: Info, as: 'Info' }],
  },
  {
    model: Student,
    as: 'StudentProfile',
    include: [{ model: Info, as: 'Info' }],
  },
]);

// Update user details (excluding password)
exports.updateUser = factory.updateOne(User, 'user_id');

// Delete user
exports.deleteUser = factory.deleteOne(User, 'user_id');
