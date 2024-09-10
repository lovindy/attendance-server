const multer = require('multer'); // For handling file uploads
const AppError = require('./appError');

// Setup multer for file uploads
const multerStorage = multer.memoryStorage(); // Store files in memory

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single('photo');

module.exports = uploadUserPhoto;
