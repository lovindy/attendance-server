// server.js
const sequelize = require('./config/database');
const app = require('./app');
require('dotenv').config();

// Define port
const PORT = process.env.PORT || 8000;

// Connect to the database
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Database connected successfully');
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.log('Error: ', err);
  });
