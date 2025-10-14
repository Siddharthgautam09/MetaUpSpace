// Simple test script to see the full error without nodemon truncation
process.on('uncaughtException', (error) => {
  console.error('=== FULL UNCAUGHT EXCEPTION ===');
  console.error('Error:', error);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('================================');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('===========================');
  process.exit(1);
});

console.log('Starting application...');

// Import the main app
require('./src/app.ts');