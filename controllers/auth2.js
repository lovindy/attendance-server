const crypto = require('crypto');
const {
  sequelize,
  User,
  Info,
  Admin,
  School,
  SchoolAdmin,
} = require('../models');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const { Op } = require('sequelize');
const {
  createVerificationToken,
  sendVerificationEmail,
  createSendToken,
} = require('../utils/authUtils');

// ----------------------------
// SIGNUP FUNCTION
// ----------------------------
exports.signup = catchAsync(async (req, res, next) => {
  // 1. Extract necessary fields from the request body.
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

  // 2. Validate that the password and password confirmation match.
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 3. Convert the date of birth to a Date object and validate its format.
  const formattedDob = new Date(dob);
  if (isNaN(formattedDob.getTime())) {
    return next(new AppError('Invalid date format for Date of Birth', 400));
  }

  // 4. Generate a verification token and its hashed version.
  const { token: verificationToken, hashedToken } = createVerificationToken();

  // 5. Create a temporary JWT token with user data and the hashed verification token.
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
      emailVerificationToken: hashedToken,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN || '10m' }
  );

  // 6. Construct the verification URL and send it via email.
  const verificationUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${verificationToken}?token=${tempToken}`;
  await sendVerificationEmail(email, verificationUrl);

  // 7. Respond with a success message and the temporary token.
  res.status(200).json({
    status: 'success',
    message:
      'Verification email sent. Please verify your email to complete registration.',
    token: tempToken,
  });
});

// ----------------------------
// VERIFY EMAIL FUNCTION
// ----------------------------
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const tempToken = req.query.token;

  const decoded = await jwt.verify(tempToken, process.env.JWT_SECRET);

  if (decoded.emailVerificationToken !== hashedToken) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  const transaction = await sequelize.transaction();
  try {
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

    // Create the user first
    const user = await User.create(
      { email, password, emailVerified: true },
      { transaction }
    );

    // Create info record and get info_id
    const info = await Info.create(
      {
        first_name,
        last_name,
        phone_number,
        address,
        dob,
      },
      { transaction }
    );

    // Create the school record
    const school = await School.create(
      { school_name, school_address, school_phone_number },
      { transaction }
    );

    // Use the info_id from Info creation for Admin creation
    const admin = await Admin.create(
      { user_id: user.user_id, info_id: info.info_id },
      { transaction }
    );

    // Create the SchoolAdmin record
    await SchoolAdmin.create(
      { admin_id: admin.admin_id, school_id: school.school_id },
      { transaction }
    );

    // Commit the transaction if all records are created successfully
    await transaction.commit();

    res.status(200).json({
      status: 'success',
      message: 'Email verified and account created successfully!',
    });
  } catch (err) {
    await transaction.rollback();
    return next(new AppError('Failed to create user and school', 500));
  }
});

// ----------------------------
// REQUIRE EMAIL VERIFICATION FUNCTION
// ----------------------------
exports.requireEmailVerification = catchAsync(async (req, res, next) => {
  // 1. Check if the user’s email is verified.
  if (!req.user.emailVerified) {
    return next(
      new AppError('Please verify your email to access this resource.', 403)
    );
  }
  // 2. Proceed to the next middleware if email is verified.
  next();
});

// ----------------------------
// LOGIN FUNCTION
// ----------------------------
exports.login = catchAsync(async (req, res, next) => {
  // 1. Extract email and password from the request body.
  const { email, password } = req.body;

  // 2. Ensure both email and password are provided.
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 3. Find the user by email and verify the password.
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 4. Generate and send JWT token to the client.
  createSendToken(user, 200, req, res);
});

// ----------------------------
// LOGOUT FUNCTION
// ----------------------------
exports.logout = (req, res) => {
  // 1. Set a cookie to invalidate the JWT.
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000), // Cookie expires in 1 second.
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // 2. Send response indicating successful logout.
  res
    .status(200)
    .json({ status: 'success', message: 'Logged out successfully' });
};

// ----------------------------
// PROTECT MIDDLEWARE
// ----------------------------
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Extract token from authorization header or cookies.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2. Check if token is provided.
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 3. Verify the token and decode the payload.
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // 4. Find the user associated with the token.
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 5. Check if the user has changed the password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // 6. Attach user details to the request object and proceed.
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// ----------------------------
// RESTRICT ACCESS TO SPECIFIC ROLES FUNCTION
// ----------------------------
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // 1. Check if the user's role is included in the allowed roles.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    // 2. Proceed if user role is permitted.
    next();
  };

// ----------------------------
// CHECK IF USER IS LOGGED IN FUNCTION
// ----------------------------
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1. Check if JWT is present in cookies.
  if (req.cookies.jwt) {
    try {
      // 2. Verify the token and decode its payload.
      const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // 3. Find the user associated with the token.
      const currentUser = await User.findByPk(decoded.id);
      if (!currentUser || currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 4. Attach user details to response locals and proceed.
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  // 5. Proceed if no token is present.
  next();
});

// ----------------------------
// FORGOT PASSWORD FUNCTION
// ----------------------------
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Find user by email.
  const user = await User.findOne({ where: { email: req.body.email } });

  // 2. Return error if user is not found.
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 3. Generate a password reset token and save it.
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 4. Construct the password reset URL.
  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  // 5. Attempt to send the password reset email.
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // 6. Handle email sending errors by resetting fields and sending an error response.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

// ----------------------------
// RESET PASSWORD FUNCTION
// ----------------------------
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Hash the reset token from the request parameters.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2. Find the user with the matching reset token and valid expiration time.
  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  // 3. Return error if token is invalid or expired.
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 4. Update the user's password and clear the reset token fields.
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 5. Generate and send JWT token to the client.
  createSendToken(user, 200, req, res);
});

// ----------------------------
// UPDATE PASSWORD FUNCTION
// ----------------------------
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Find the current user with their password.
  const user = await User.scope('withPassword').findByPk(req.user.user_id);

  // 2. Verify that the current password provided is correct.
  if (!(await user.correctPassword(req.body.passwordCurrent))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3. Update the password and save the user.
  user.password = req.body.password;
  await user.save();

  // 4. Generate and send JWT token to the client.
  createSendToken(user, 200, req, res);
});
