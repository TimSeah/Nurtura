const createError = require('http-errors'); // For creating HTTP error objects
const express = require('express');       // The core Express.js framework
const path = require('path');             // For working with file and directory paths
const cookieParser = require('cookie-parser'); // Middleware for parsing cookies
const logger = require('morgan');         // HTTP request logger middleware
const mongoose = require('mongoose');     // Mongoose for MongoDB object modeling
const cors = require('cors');             // CORS middleware for cross-origin requests
require('dotenv').config();               // Load environment variables from .env file


process.on('SIGINT', cleanup);  
process.on('SIGTERM', cleanup); 

// Function to clean up resources before exiting
async function cleanup() {
  console.log('Server shutting down...');
  try {
    if (mongoose.connection.readyState === 1) { // Check if connection is open
      await mongoose.disconnect(); // Disconnect from MongoDB
      console.log('MongoDB disconnected due to app termination');
    }
    process.exit(0); // Exit successfully
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1); // Exit with error
  }
}

// --- Initialize Express Application ---
const app = express();

// --- MongoDB Connection ---
// Mongoose connects to your MongoDB database using the connection string
// provided in the MONGO_URI environment variable from your .env file.
mongoose.connect(process.env.MONGO_URI, {
  // Recommended options for stable connections with the latest MongoDB driver
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  const PORT = process.env.PORT || 5000; // Make sure PORT is defined here or globally
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('You can test the server by navigating to http://localhost:5000 in your browser.');
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  // If the database connection fails, exit the process as the server
  // cannot function without it.
  process.exit(1);
});

// --- Middleware Setup ---
// Enable CORS for all origins.
// IMPORTANT: In production, you should restrict this to your frontend's specific domain:
// app.use(cors({ origin: 'http://localhost:3000' })); // Example for development
app.use(cors());

// Log HTTP requests to the console in 'dev' format (colorful, concise output)
app.use(logger('dev'));

// Parse incoming requests with JSON payloads. This is crucial for your React app
// to send data (like event details) to the server.
app.use(express.json());

// Parse incoming requests with URL-encoded payloads.
// `extended: false` means it uses the querystring library for parsing.
app.use(express.urlencoded({ extended: false }));

// Parse cookies attached to the client request object.
app.use(cookieParser());

// Serve static files (like your React build output in production, or other static assets)
// from the 'public' directory.
app.use(express.static(path.join(__dirname, 'public')));

// --- Route Definitions ---
// Import your route handlers.
// You will create these files (e.g., './routes/index.js', './routes/events.js')
// to define your API endpoints for different resources.
const indexRouter = require('./routes/index'); 
const eventsRouter = require('./routes/events');

// Assign imported routers to specific URL paths.
app.use('/', indexRouter);
app.use('/api/events', eventsRouter); 

// --- Error Handling Middleware ---

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// General error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error details in development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Log the error for debugging purposes (server-side)
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message,
    // Only send stack trace in development for security reasons
    error: req.app.get('env') === 'development' ? err : {}
  });
});

// --- Server Start ---
// Define the port for the server to listen on.
// It tries to use the PORT environment variable, or defaults to 3000.
const port = process.env.PORT || 3000;
module.exports = app;

// If this file is run directly (e.g., `node server.js`), ensure the server starts.
// This block ensures that if `module.exports = app;` is the last thing,
// the server still starts if not imported elsewhere.
// However, since we've placed `app.listen` within the mongoose.connect.then(),
// this `if` block is not strictly necessary for startup, but good practice
// if `app.listen` were outside the connect block.
if (require.main === module) {
  // This means server.js was run directly
  // The app.listen is handled in the mongoose.connect.then() block
  // No need to duplicate app.listen here.
}
