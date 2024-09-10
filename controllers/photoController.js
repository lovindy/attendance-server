// Required dependencies
const multer = require('multer');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // Ensure this is set in your environment
});

// Setup multer for file uploads - in-memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // Only accept image files
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Middleware to handle user photo upload using multer
exports.uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single('photo');

// Middleware to resize and upload image to AWS S3
exports.resizeAndUploadUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Define filename for S3 storage
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Resize the image using sharp
  const resizedImageBuffer = await sharp(req.file.buffer)
    .resize(500, 500) // Resize to 500x500 pixels
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer(); // Convert back to buffer for upload

  // Prepare upload parameters for S3
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 bucket name from environment variables
    Key: `users/${req.file.filename}`, // File path in S3 bucket
    Body: resizedImageBuffer, // File buffer
    ContentType: 'image/jpeg', // MIME type of the file
    ACL: 'public-read', // File permissions (publicly readable)
  };

  // Upload the image to S3
  await s3.upload(params).promise();

  // Store the file URL to user object for future reference
  req.file.location = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

  next();
});
