const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const expressWinston = require('express-winston');
const {initializeCounter} = require("./models/Patient");

const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const allfilesRoutes = require('./routes/allFilesRoutes');
const filesRoutes = require('./routes/filesRoutes');


const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // This replaces bodyParser.urlencoded({ extended: true })


app.use(cors({
  origin: 'http://localhost:5000', // Allow only your domain
  optionsSuccessStatus: 200
}));

// express-winston logger to log HTTP requests
app.use(expressWinston.logger({
  winstonInstance: logger,
  level: function (req, res) {
      let level = "";
      if (res.statusCode >= 100) { level = "info"; }
      if (res.statusCode >= 400) { level = "error"; }
      return level;  // Determines the level based on response status
  },
  msg: "HTTP {{req.method}} {{req.url}} responded with {{res.statusCode}} in {{res.responseTime}}ms"
}));



// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

initializeCounter(); // Initializing the counter

const verifyToken = (req, res, next) => {
  if (req.path.startsWith('/static/') || ['/', '/login', '/signup'].includes(req.path)) {
    return next(); // Continue without verifying token
  }
  console.log('Verifying token for route:', req.path);
  const token = req.headers['authorization']?.split(' ')[1]; // Assume Bearer Token
  console.log("The value of token is: ",token);
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adding the decoded information to the request
    next(); // Proceed to the next middleware/route handler
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};


// User Signup Route
app.use("/signup",signupRoutes);

//User Login Route
app.use("/login",loginRoutes);

// Middleware applied globally to all subsequent routes to verify tokens
app.use(verifyToken);

//Admin Privileges
app.use("/admin",adminRoutes);

// Doctors Routes
app.use("/doctors",doctorRoutes);

//patient Routes
app.use('/patients',patientRoutes);

//Appointment Routes
app.use('/appointments',appointmentRoutes);

//All Files Tab
app.use('/allfiles',allfilesRoutes);

//Files Routes
app.use('/files',filesRoutes);

// Serve static assets
// Express will serve up production assets from the React app
app.use(express.static(path.join(__dirname, '../../Secure Cloud-based Repository on S3 for Encrypted Medical Imaging Data  - Implementation/client/build')));

// Express serve up index.html if it doesn't recognize the route
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Secure Cloud-based Repository on S3 for Encrypted Medical Imaging Data  - Implementation/client/build', 'index.html'));
});

// express-winston error logger
app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  msg: "HTTP {{req.method}} {{req.url}} resulted in an error"
}));

// Generic error handler - after express-winston errorLogger
app.use((err, req, res, next) => {
  // Generic error response
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));