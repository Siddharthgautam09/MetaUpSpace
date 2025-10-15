// Vercel serverless function entry point
const express = require('express');

// Load environment variables
require('dotenv').config();

// Import and configure the app
let app;
let database;

try {
  // Try to import the compiled TypeScript app
  const appModule = require('../dist/app');
  app = appModule.default || appModule;
  
  // Import database connection
  const dbModule = require('../dist/models/database');
  database = dbModule.default || dbModule;
} catch (error) {
  console.error('Error loading compiled app:', error);
  
  // Fallback: create a basic error response
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  });
}

// Add explicit CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  if (database && typeof database.connect === 'function') {
    try {
      await database.connect();
    } catch (error) {
      console.error('Database connection error:', error);
      // Continue anyway - some endpoints might not need DB
    }
  }
  next();
});

// Export for Vercel
module.exports = app;
