const { Sequelize } = require('sequelize');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.options = {}; // Collect options for findAll here
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let filters = {};
    Object.keys(queryObj).forEach((key) => {
      if (/\b(gte|gt|lte|lt)\b/.test(key)) {
        const [field, operator] = key.split('_');
        filters[field] = { [Sequelize.Op[operator]]: queryObj[key] };
      } else {
        filters[key] = queryObj[key];
      }
    });

    console.log('Filters:', filters); // Debug log
    this.options.where = filters;

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .map((el) => el.split(':'));
      this.options.order = sortBy;
    } else {
      this.options.order = [['createdAt', 'DESC']];
    }

    console.log('Sort Order:', this.options.order); // Debug log
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      this.options.attributes = fields;
    } else {
      this.options.attributes = { exclude: ['__v'] }; // Assuming '__v' is relevant
    }

    console.log('Fields:', this.options.attributes); // Debug log
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const offset = (page - 1) * limit;

    this.options.limit = limit;
    this.options.offset = offset;

    console.log('Pagination:', { limit, offset }); // Debug log
    return this;
  }

  async exec() {
    try {
      const result = await this.query.findAll(this.options);
      console.log('Result:', result); // Debug log
      return result;
    } catch (err) {
      console.error('Error executing query:', err); // Debug log for errors
      throw err;
    }
  }
}

module.exports = APIFeatures;
