import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

console.log('=== DEBUG APP START ===');

try {
  console.log('1. Loading config...');
  const config = require('../config').default;
  console.log('✅ Config loaded');

  console.log('2. Loading database...');
  const database = require('./models/database').default;
  console.log('✅ Database module loaded');

  console.log('3. Loading logger...');
  const { default: logger, morganStream } = require('./utils/logger');
  console.log('✅ Logger loaded');

  console.log('4. Loading routes...');
  
  console.log('4a. Loading auth routes...');
  const authRoutes = require('./routes/auth').default;
  console.log('✅ Auth routes loaded');
  
  console.log('4b. Loading project routes...');
  const projectRoutes = require('./routes/projects').default;
  console.log('✅ Project routes loaded');
  
  console.log('4c. Loading task routes...');
  const taskRoutes = require('./routes/tasks').default;
  console.log('✅ Task routes loaded');
  
  console.log('4d. Loading analytics routes...');
  const analyticsRoutes = require('./routes/analytics').default;
  console.log('✅ Analytics routes loaded');

  console.log('5. Creating Express app...');
  const app = express();
  console.log('✅ Express app created');

  console.log('6. Setting up middleware...');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*', credentials: false }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  console.log('✅ Middleware configured');

  console.log('7. Setting up routes...');
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Routes configured');

  console.log('8. Connecting to database...');
  database.connect()
    .then(() => {
      console.log('✅ Database connected');
      
      console.log('9. Starting server...');
      const server = app.listen(5002, () => {
        console.log('✅ Server started on port 5002');
        console.log('🎉 DEBUG APP SUCCESSFUL!');
        
        // Keep running for a few seconds to test
        setTimeout(() => {
          console.log('⏰ Shutting down debug server...');
          server.close(() => {
            database.disconnect().then(() => {
              console.log('✅ Shutdown complete');
              process.exit(0);
            });
          });
        }, 3000);
      });
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Error during app initialization:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}