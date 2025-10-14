const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== Step-by-step server test ===');

// Step 1: Test basic express app
console.log('Step 1: Creating Express app...');
const app = express();
console.log('✅ Express app created');

// Step 2: Test MongoDB connection
console.log('Step 2: Testing MongoDB connection...');
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Step 3: Test basic server start
    console.log('Step 3: Starting basic server...');
    const server = app.listen(5001, () => {
      console.log('✅ Server started on port 5001');
      console.log('🎉 Basic server test successful!');
      
      // Close everything
      server.close(() => {
        mongoose.disconnect().then(() => {
          console.log('✅ Cleanup complete');
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  });