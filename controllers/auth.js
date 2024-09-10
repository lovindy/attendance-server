const {
  sequelize,
  User,
  Info,
  Admin,
  School,
  SchoolAdmin,
} = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const Email = require('../utils/email');

// Function to sign a JWT token for the user
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Token expiration time
  });
};

// Function to create and send the JWT token as a cookie in the response
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.user_id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents access to the cookie via JavaScript
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Ensures the cookie is sent over HTTPS
  });

  user.password = undefined; // Hide the password from the output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      id: user.user_id,
      email: user.email,
      role: user.role, // Include additional user data as needed
    },
  });
};

// Signup function
exports.signup = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    passwordConfirm,
    address,
    dob,
    first_name,
    last_name,
    phone_number,
    school_name,
    school_address,
    school_phone_number,
  } = req.body;

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Validate date of birth format
  const formattedDob = new Date(dob);
  if (isNaN(formattedDob.getTime())) {
    return next(new AppError('Invalid date format for Date of Birth', 400));
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Create a temporary JWT that contains the user data and hashed verification token
  const tempToken = jwt.sign(
    {
      email,
      password,
      address,
      dob: formattedDob,
      first_name,
      last_name,
      phone_number,
      school_name,
      school_address,
      school_phone_number,
      emailVerificationToken: hashedToken, // Include the hashed token for verification
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN || '10m' } // Default to 10 minutes
  );

  // Send the verification email with the plain (unhashed) token
  const verificationUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${verificationToken}?token=${tempToken}`;
  const verificationEmail = new Email({ email }, verificationUrl);

  await verificationEmail.sendVerification();

  res.status(200).json({
    status: 'success',
    message:
      'Verification email sent. Please verify your email to complete registration.',
    token: tempToken, // Return the token to be used later for verification
  });
});

// Verify email handler
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // Hash the token from the URL parameters
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Get the JWT token from the query parameters
  const tempToken = req.query.token;

  // Verify the JWT and decode it
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(tempToken, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // Check if the hashed token matches the one in the decoded JWT
  if (decoded.emailVerificationToken !== hashedToken) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // Begin the transaction
  const transaction = await sequelize.transaction();

  try {
    // Extract user and school information from the decoded JWT
    const {
      email,
      password,
      address,
      dob,
      first_name,
      last_name,
      phone_number,
      school_name,
      school_address,
      school_phone_number,
    } = decoded;

    // Create the user, school, and related entities within a transaction
    const user = await User.create(
      {
        email,
        password,
        emailVerified: true, // Mark the email as verified
      },
      { transaction }
    );

    await Info.create(
      {
        user_id: user.user_id,
        first_name,
        last_name,
        phone_number,
        address,
        dob,
      },
      { transaction }
    );

    const school = await School.create(
      {
        school_name,
        school_address,
        school_phone_number,
      },
      { transaction }
    );

    const admin = await Admin.create(
      { user_id: user.user_id },
      { transaction }
    );

    await SchoolAdmin.create(
      { admin_id: admin.admin_id, school_id: school.school_id },
      { transaction }
    );

    // Commit the transaction after successful creation
    await transaction.commit();

    res.status(200).json({
      status: 'success',
      message: 'Email verified and account created successfully!',
    });
  } catch (err) {
    // Rollback the transaction if something goes wrong
    await transaction.rollback();
    return next(new AppError('Failed to create user and school', 500));
  }
});

// Middleware to check if the user's email is verified
exports.requireEmailVerification = catchAsync(async (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(
      new AppError(
        'Please verify your email address to access this resource.',
        403
      )
    );
  }
  next();
});

// Login function
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find the user by email and include the password (scope 'withPassword')
  const user = await User.scope('withPassword').findOne({ where: { email } });

  // Check if the user exists and if the provided password is correct
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Send the JWT token to the user
  createSendToken(user, 200, req, res);
});

// Logout function
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000), // Set the cookie to expire in 1 second
    httpOnly: true, // Prevents access to the cookie via JavaScript
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Ensure cookie is sent over HTTPS
  });

  res
    .status(200)
    .json({ status: 'success', message: 'Logged out successfully' });
};

// Middleware to protect routes (requires authentication)
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if the token is provided in the Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // If no token is found, return an error
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Find the user associated with the token
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // Check if the user has changed their password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to the protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Restrict access to specific roles
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // Check if the user's role is allowed to access this route
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

// Check if the user is logged in (used for frontend)
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // Verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Find the user associated with the token
      const currentUser = await User.findByPk(decoded.id);
      if (!currentUser || currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // Make the user data available to the views
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

// Forgot Password function
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Find the user by email
  const user = await User.findOne({ where: { email: req.body.email } });

  // If the user does not exist, return an error
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate a password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // // Construct the password reset URL
  // const resetURL = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword/${resetToken}`;

  // Testing with local client (should be the frontend domain later)
  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  // Send the reset email
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // If email sending fails, reset the password reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

const { Op } = require('sequelize');
// Reset Password function
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Hash the token received from the user
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find the user with the hashed token and check if it's still valid
  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: Date.now() }, // Check if the token has not expired
    },
  });

  // If the user is not found or the token is invalid, return an error
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // Check if passwords match
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match.', 400));
  }

  // Update the user's password and clear the reset token fields
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in by sending a JWT token
  createSendToken(user, 200, req, res);
});

// Update Password function for logged-in users
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get the user from the collection
  const user = await User.scope('withPassword').findByPk(req.user.user_id);

  // Check if the current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // Update the user's password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log the user in by sending a JWT token
  createSendToken(user, 200, req, res);
});
