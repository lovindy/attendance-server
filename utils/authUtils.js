const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Email = require('./email');

// Auth Utils Function
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.user_id); // Use signToken directly

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      id: user.user_id,
      email: user.email,
      role: user.role,
    },
  });
};

exports.createVerificationToken = () => {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  return { token: verificationToken, hashedToken };
};

exports.sendVerificationEmail = async (email, verificationUrl) => {
  const emailService = new Email({ email }, verificationUrl);
  await emailService.sendVerification();
};
