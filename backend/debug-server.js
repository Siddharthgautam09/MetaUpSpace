// Debug script to identify the crash issue
const path = require('path');
const { spawn } = require('child_process');

console.log('Starting debug server...');

const tsNode = spawn('npx', ['ts-node', 'src/app.ts'], {
  cwd: __dirname,
  stdio: 'inherit'
});

tsNode.on('error', (error) => {
  console.error('Failed to start process:', error);
});

tsNode.on('exit', (code, signal) => {
  console.error(`Process exited with code ${code} and signal ${signal}`);
});

// Catch unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});