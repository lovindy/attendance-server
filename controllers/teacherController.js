const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const { Teacher, Info, User, sequelize, SchoolAdmin } = require('../models');
const {
  sendVerificationEmail,
  createVerificationToken,
} = require('../utils/authUtils');

// Get one teacher
exports.getTeacher = factory.getOne(Teacher, 'teacher_id', [
  {
    model: Teacher,
    as: 'TeacherProfile',
    include: [{ model: Info, as: 'Info' }],
  },
]);

// Get all teachers
exports.getAllTeachers = factory.getAll(Teacher, {}, [
  {
    model: Teacher,
    as: 'TeacherProfile',
    include: [{ model: Info, as: 'Info' }],
  },
]);

// Update teacher
exports.updateTeacher = factory.updateOne(Teacher, 'teacher_id');

// Delete teacher
exports.deleteTeacher = factory.deleteOne(Teacher, 'teacher_id');

// ----------------------------
// SIGNUP FUNCTION FOR TEACHERS
// ----------------------------
exports.signupTeacher = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    passwordConfirm,
    address,
    dob,
    first_name,
    last_name,
    phone_number,
    school_admin_id,
  } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const formattedDob = new Date(dob);
  if (isNaN(formattedDob.getTime())) {
    return next(new AppError('Invalid date format for Date of Birth', 400));
  }

  const { token: verificationToken, hashedToken } = createVerificationToken();

  const tempToken = jwt.sign(
    {
      email,
      password,
      address,
      dob: formattedDob,
      first_name,
      last_name,
      phone_number,
      school_admin_id,
      emailVerificationToken: hashedToken,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN || '10m' }
  );

  const verificationUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/teacher/${verificationToken}?token=${tempToken}`;

  await sendVerificationEmail(email, verificationUrl);

  res.status(200).json({
    status: 'success',
    message:
      'Verification email sent. Please verify your email to complete registration.',
    token: tempToken,
  });
});

// ----------------------------
// VERIFY EMAIL FUNCTION FOR TEACHERS
// ----------------------------
exports.verifyTeacherEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const tempToken = req.query.token;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    // Check if the hashed tokens match
    if (decoded.emailVerificationToken !== hashedToken) {
      return next(new AppError('Token is invalid or has expired.', 400));
    }

    // Destructure the required values from the decoded token
    const {
      email,
      password,
      address,
      dob,
      first_name,
      last_name,
      phone_number,
      school_admin_id,
    } = decoded;

    // Validate the necessary fields are present
    if (!email || !password || !first_name || !last_name || !school_admin_id) {
      return next(new AppError('Missing required user information.', 400));
    }

    const transaction = await sequelize.transaction();

    try {
      // Create the User
      const user = await User.create(
        { email, password, emailVerified: true, role: 'teacher' },
        { transaction }
      );

      // Create the Info record
      const info = await Info.create(
        { first_name, last_name, phone_number, address, dob },
        { transaction }
      );

      // Create the Teacher record
      await Teacher.create(
        {
          user_id: user.user_id,
          info_id: info.info_id,
          school_admin_id,
        },
        { transaction }
      );

      // Commit the transaction if all operations are successful
      await transaction.commit();

      res.status(200).json({
        status: 'success',
        message: 'Email verified and teacher account created successfully!',
      });
    } catch (err) {
      // Rollback the transaction in case of any error
      await transaction.rollback();
      console.error('Transaction Error:', err);
      return next(new AppError('Failed to create teacher account', 500));
    }
  } catch (err) {
    // Handle token verification error
    console.error('JWT Error:', err);
    return next(new AppError('Failed to verify token', 400));
  }
});
