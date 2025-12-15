var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var compression = require('compression');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const connectDB = require('./config/db');

connectDB();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// Add compression middleware for better performance with many users
app.use(compression());

// Optimize JSON parsing limits for better performance
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { 
  // Cache static assets for 1 hour to reduce server load
  maxAge: '1h',
  etag: false 
}));

// CORS configuration - allow both development and production URLs
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // Alternative dev
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL   // Production URL
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  // Add caching headers to reduce unnecessary requests
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // For API requests, return JSON error
  res.status(err.status || 500).json({
    success: false,
    msg: err.message || 'Internal Server Error',
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
