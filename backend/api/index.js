// Vercel serverless function entry point
// This file must be JavaScript for Vercel to recognize it

// Import the compiled Express app
const app = require('../dist/app').default;

// Export for Vercel
module.exports = app;
