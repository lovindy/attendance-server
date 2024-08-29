// Frameworks and libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import routes
const attendanceRoutes = require('./routes/attendanceRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

const globalErrorHandler = require('./controllers/errorController');
// Middleware
const app = express();

// Body parser
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the School API');
});
// User Relationship Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/admins', adminRoutes);

// Function Routes
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/classes', classRoutes);

app.use(globalErrorHandler);
// Export app
module.exports = app;
