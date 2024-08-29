// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const env = process.env.NODE_ENV || 'development';

// // Base configuration
// const baseConfig = {
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   host: process.env.DB_HOST,
//   dialect: process.env.DB_DIALECT,
// };

// // Environment-specific configurations (if any additional settings are needed)
// const config = {
//   development: { ...baseConfig },
//   test: { ...baseConfig },
//   production: { ...baseConfig },
// };

// // Select the configuration based on the current environment
// const sequelize = new Sequelize(
//   config[env].database,
//   config[env].username,
//   config[env].password,
//   {
//     host: config[env].host,
//     dialect: config[env].dialect,
//   }
// );

// module.exports = sequelize;

const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

// Base configuration
const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql', // Explicitly specify the dialect
  dialectOptions: {
    // Adjust these options based on MySQL configuration
    // Example:
    // ssl: {
    //   require: true, // Enable SSL if required
    // },
    // timezone: 'UTC', // Set the timezone
  },
};

// Environment-specific configurations (if any additional settings are needed)
const config = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig },
};

// Select the configuration based on the current environment
const sequelize = new Sequelize(
  config[env].database,
  config[env].username,
  config[env].password,
  {
    host: config[env].host,
    dialect: config[env].dialect,
    dialectOptions: config[env].dialectOptions,
  }
);

module.exports = sequelize;
