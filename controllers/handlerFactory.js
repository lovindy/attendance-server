const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Create handlerFactory function
// Create One
exports.createOne = (Model, popOptions = []) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body, { include: popOptions }); // Include associations

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// Get One
exports.getOne = (Model, idField, popOptions = []) =>
  catchAsync(async (req, res, next) => {
    let options = {
      where: { [idField]: req.params.id },
      include: popOptions, // Include associations
    };

    const doc = await Model.findOne(options);

    if (!doc) {
      return next(new AppError(`No document found with that ${idField}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// Get All Need to fix more flexible
exports.getAll = (Model, additionalFilter = {}, popOptions = []) =>
  catchAsync(async (req, res, next) => {
    let filter = { ...additionalFilter };

    if (req.params.id) filter = { ...filter, id: req.params.id };

    const features = new APIFeatures(Model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.exec({
      where: filter,
      include: popOptions,
    });

    if (!doc || doc.length === 0) {
      return next(new AppError('No documents found', 404));
    }

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });

exports.updateOne = (Model, idField) =>
  catchAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Update the record
      const [affectedRows] = await Model.update(updates, {
        where: { [idField]: id },
      });

      if (affectedRows === 0) {
        return next(
          new AppError(`No document found with that ${idField}`, 404)
        );
      }

      // Fetch the updated document
      const updatedDoc = await Model.findOne({ where: { [idField]: id } });

      res.status(200).json({
        status: 'success',
        data: updatedDoc,
      });
    } catch (err) {
      // Return a JSON error response
      next(new AppError('Server error, please try again later.', 500));
    }
  });

exports.deleteOne = (Model, idField) =>
  catchAsync(async (req, res, next) => {
    console.log(
      `Attempting to delete record with ${idField}: ${req.params.id}`
    ); // Log the correct ID field
    const doc = await Model.destroy({
      where: { [idField]: req.params.id },
    });

    if (!doc) {
      console.error(`No document found with ${idField}: ${req.params.id}`); // Log if no record is found
      return next(new AppError(`No document found with that ${idField}`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
