import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from '../config';
import database from './models/database';
import logger, { morganStream } from './utils/logger';

console.log('=== DEBUG: Starting app initialization ===');

// Try importing routes one by one to find the issue
try {
  console.log('Importing auth routes...');
  const authRoutes = require('./routes/auth').default;
  console.log('✅ Auth routes imported successfully');
} catch (error) {
  console.error('❌ Error importing auth routes:', error.message);
}

try {
  console.log('Importing project routes...');
  const projectRoutes = require('./routes/projects').default;
  console.log('✅ Project routes imported successfully');
} catch (error) {
  console.error('❌ Error importing project routes:', error.message);
}

try {
  console.log('Importing task routes...');
  const taskRoutes = require('./routes/tasks').default;
  console.log('✅ Task routes imported successfully');
} catch (error) {
  console.error('❌ Error importing task routes:', error.message);
}

try {
  console.log('Importing analytics routes...');
  const analyticsRoutes = require('./routes/analytics').default;
  console.log('✅ Analytics routes imported successfully');
} catch (error) {
  console.error('❌ Error importing analytics routes:', error.message);
}

console.log('=== DEBUG: Route imports complete ===');

// Now try to start the database
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await database.connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabase();