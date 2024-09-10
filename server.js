// server.js
const sequelize = require('./config/database');
const app = require('./app');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

// Define port
const PORT = process.env.PORT || 8000;

// Connect to the database
sequelize
  .sync({
    force: process.env.NODE_ENV === 'development', // True for development, false for production
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Database connected successfully`);
      console.log(
        `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode...`
      );
    });
  })
  .catch((err) => {
    console.log('Error: ', err);
  });
