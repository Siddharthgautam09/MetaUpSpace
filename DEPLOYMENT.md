# Enterprise Task Management System - Deployment Guide

## Overview

This guide covers the deployment of the Enterprise Task Management System to production environments including Railway (backend), Vercel (frontend), and MongoDB Atlas (database).

## Prerequisites

- MongoDB Atlas account
- Railway account (for backend deployment)
- Vercel account (for frontend deployment)
- Domain name (optional but recommended)

## 1. Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Cluster

1. **Sign up for MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Create a new cluster**:
   - Choose cloud provider (AWS, Google Cloud, or Azure)
   - Select region closest to your users
   - Choose cluster tier (M0 for free tier)
3. **Configure security**:
   - Create database user with read/write permissions
   - Add IP addresses to whitelist (0.0.0.0/0 for all IPs in development)
4. **Get connection string**:
   - Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>`

### Database Initialization

```javascript
// Connect to your cluster and create initial admin user
use enterprise_task_management;

db.users.insertOne({
  email: "admin@company.com",
  password: "$2b$12$hashed_password_here", // Use bcrypt to hash
  firstName: "System",
  lastName: "Administrator",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 2. Backend Deployment (Railway)

### Setup Railway Project

1. **Connect Repository**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   ```

2. **Configure Environment Variables**:
   ```bash
   # Production environment variables
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/enterprise_task_management"
   railway variables set JWT_SECRET="your-super-secret-jwt-key-256-bit"
   railway variables set JWT_REFRESH_SECRET="your-refresh-secret-key-256-bit"
   railway variables set CORS_ORIGIN="https://your-frontend-domain.vercel.app"
   railway variables set BCRYPT_SALT_ROUNDS=12
   ```

3. **Deploy**:
   ```bash
   # Deploy to Railway
   railway up
   ```

### Alternative: Manual Deployment

1. **Login to Railway Dashboard**
2. **Create new project from GitHub**
3. **Select backend folder as root**
4. **Add environment variables** in Railway dashboard
5. **Deploy automatically** on push to main branch

## 3. Frontend Deployment (Vercel)

### Setup Vercel Project

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory**:
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
   ```

### Alternative: GitHub Integration

1. **Connect GitHub repository** to Vercel
2. **Set root directory** to `frontend`
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## 4. Domain Configuration (Optional)

### Custom Domains

1. **Railway (Backend)**:
   - Go to Railway project settings
   - Add custom domain
   - Configure DNS records (CNAME)

2. **Vercel (Frontend)**:
   - Go to Vercel project settings
   - Add custom domain
   - Configure DNS records (CNAME or A record)

### SSL Certificates

Both Railway and Vercel provide automatic SSL certificates for custom domains.

## 5. Production Environment Configuration

### Backend Production Settings

```typescript
// Update config/index.ts for production
export const server = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  // ... other settings
};

export const database = {
  mongodb: {
    uri: process.env.MONGODB_URI, // Atlas connection string
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
};
```

### Frontend Production Settings

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

## 6. Monitoring and Logging

### Railway Monitoring

1. **View logs**: `railway logs`
2. **Monitor metrics** in Railway dashboard
3. **Set up alerts** for downtime or errors

### Application Monitoring

```typescript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});
```

## 7. Security Checklist

### Backend Security

- [ ] JWT secrets are cryptographically strong (256-bit)
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] MongoDB connection uses authentication
- [ ] Logs don't expose sensitive information

### Frontend Security

- [ ] API URL points to HTTPS backend
- [ ] No sensitive data in client-side code
- [ ] CSP headers are configured
- [ ] Dependencies are up to date

## 8. Performance Optimization

### Backend Optimization

```typescript
// Enable compression
app.use(compression());

// Optimize MongoDB queries
const projects = await Project.find(filter)
  .populate('managerId', 'firstName lastName email')
  .lean(); // Use lean() for read-only queries

// Add database indexes
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ status: 1, priority: 1 });
```

### Frontend Optimization

```typescript
// Enable Image Optimization
// next.config.js
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
};

// Use dynamic imports for large components
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <LoadingSpinner />,
});
```

## 9. Backup and Recovery

### Database Backup

```bash
# MongoDB Atlas automatic backups are enabled by default
# For manual backup:
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/enterprise_task_management"
```

### Code Backup

- Repository is backed up on GitHub
- Railway and Vercel maintain deployment history
- Environment variables should be documented securely

## 10. Continuous Deployment

### GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway deploy --service backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 11. Testing in Production

### API Testing

```bash
# Test health endpoint
curl https://your-backend-domain.railway.app/health

# Test authentication
curl -X POST https://your-backend-domain.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'
```

### Frontend Testing

1. **Test user registration and login**
2. **Verify dashboard loads correctly**
3. **Test project and task creation**
4. **Verify responsive design on mobile**

## 12. Maintenance

### Regular Updates

- Update dependencies monthly
- Monitor security advisories
- Review logs for errors
- Monitor performance metrics

### Scaling

- **Database**: Upgrade MongoDB Atlas tier as needed
- **Backend**: Railway auto-scales based on traffic
- **Frontend**: Vercel handles scaling automatically

## Support

For deployment issues:

1. **Check logs** in Railway/Vercel dashboards
2. **Verify environment variables** are set correctly
3. **Test database connectivity** from deployment environment
4. **Contact support** for platform-specific issues

---

**Deployment completed! Your enterprise task management system is now live in production.**