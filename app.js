// Module and Libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// User Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');

// School Routes
const schoolRoutes = require('./routes/schoolRoutes');
const schoolAdminRoutes = require('./routes/schoolAdminRoutes');

// Features Routes
const attendanceRoutes = require('./routes/attendanceRoutes');
const classRoutes = require('./routes/classRoutes');

// Information Route
const infoRoutes = require('./routes/infoRoutes');

const globalErrorHandler = require('./controllers/errorController');

// App Middleware
const app = express();

// Cookie parser
app.use(cookieParser());
// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(bodyParser.json());

// Home route (test endpoint)
app.get('/', (req, res) => {
  res.send('Welcome to the HexCode+ School API');
});

// User Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/students', studentRoutes);

// School Routes
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/school-admin', schoolAdminRoutes);

// Features Routes
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/classes', classRoutes);

// Information Route
app.use('/api/v1/info', infoRoutes);

app.use(globalErrorHandler);
// Export app
module.exports = app;
