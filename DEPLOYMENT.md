# 🚀 Production Deployment Guide# Enterprise Task Management System - Deployment Guide



Complete step-by-step guide for deploying the Enterprise Task Management System to Vercel.## Overview



## 📋 Table of ContentsThis guide covers the deployment of the Enterprise Task Management System to production environments including Railway (backend), Vercel (frontend), and MongoDB Atlas (database).



1. [Pre-Deployment Checklist](#pre-deployment-checklist)## Prerequisites

2. [Generate Security Secrets](#generate-security-secrets)

3. [MongoDB Atlas Setup](#mongodb-atlas-setup)- MongoDB Atlas account

4. [Backend Deployment (Vercel)](#backend-deployment)- Railway account (for backend deployment)

5. [Frontend Deployment (Vercel)](#frontend-deployment)- Vercel account (for frontend deployment)

6. [Configure CORS](#configure-cors)- Domain name (optional but recommended)

7. [Testing Deployment](#testing-deployment)

8. [Troubleshooting](#troubleshooting)## 1. Database Setup (MongoDB Atlas)



---### Create MongoDB Atlas Cluster



## Pre-Deployment Checklist1. **Sign up for MongoDB Atlas**: https://www.mongodb.com/atlas

2. **Create a new cluster**:

Before deploying, ensure:   - Choose cloud provider (AWS, Google Cloud, or Azure)

   - Select region closest to your users

- [ ] Code pushed to GitHub   - Choose cluster tier (M0 for free tier)

- [ ] MongoDB Atlas cluster created3. **Configure security**:

- [ ] Security secrets generated   - Create database user with read/write permissions

- [ ] `.env` files configured locally   - Add IP addresses to whitelist (0.0.0.0/0 for all IPs in development)

- [ ] Local build succeeds4. **Get connection string**:

- [ ] Tests passing   - Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>`



---### Database Initialization



## Generate Security Secrets```javascript

// Connect to your cluster and create initial admin user

Run these commands to generate secure secrets:use enterprise_task_management;



```bashdb.users.insertOne({

# JWT Secret  email: "admin@company.com",

node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"  password: "$2b$12$hashed_password_here", // Use bcrypt to hash

  firstName: "System",

# JWT Refresh Secret    lastName: "Administrator",

node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"  role: "admin",

  isActive: true,

# Session Secret  createdAt: new Date(),

node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"  updatedAt: new Date()

```});

```

**Save these values** - you'll need them for environment variables.

## 2. Backend Deployment (Railway)

---

### Setup Railway Project

## MongoDB Atlas Setup

1. **Connect Repository**:

### Step 1: Create Account & Cluster   ```bash

   # Install Railway CLI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)   npm install -g @railway/cli

2. Sign up or log in   

3. Click **"Create"** → **"Cluster"**   # Login to Railway

4. Choose:   railway login

   - **Provider**: AWS / Google Cloud / Azure   

   - **Region**: Closest to your users   # Initialize project

   - **Tier**: M0 (Free) or higher   railway init

5. Click **"Create Cluster"** and wait 3-5 minutes   ```



### Step 2: Create Database User2. **Configure Environment Variables**:

   ```bash

1. Go to **Database Access** (left sidebar)   # Production environment variables

2. Click **"Add New Database User"**   railway variables set NODE_ENV=production

3. Choose **"Password"** authentication   railway variables set PORT=5000

4. Set:   railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/enterprise_task_management"

   - **Username**: `taskmanager`   railway variables set JWT_SECRET="your-super-secret-jwt-key-256-bit"

   - **Password**: Generate a strong password   railway variables set JWT_REFRESH_SECRET="your-refresh-secret-key-256-bit"

   - **Database User Privileges**: Read and write to any database   railway variables set CORS_ORIGIN="https://your-frontend-domain.vercel.app"

5. Click **"Add User"**   railway variables set BCRYPT_SALT_ROUNDS=12

6. **Save credentials securely**   ```



### Step 3: Configure Network Access3. **Deploy**:

   ```bash

1. Go to **Network Access** (left sidebar)   # Deploy to Railway

2. Click **"Add IP Address"**   railway up

3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)   ```

   - Required for Vercel serverless functions

4. Click **"Confirm"**### Alternative: Manual Deployment



### Step 4: Get Connection String1. **Login to Railway Dashboard**

2. **Create new project from GitHub**

1. Go to **Database** → Your cluster3. **Select backend folder as root**

2. Click **"Connect"**4. **Add environment variables** in Railway dashboard

3. Choose **"Connect your application"**5. **Deploy automatically** on push to main branch

4. Copy the connection string:

   ```## 3. Frontend Deployment (Vercel)

   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

   ```### Setup Vercel Project

5. Replace:

   - `<username>` with your database username1. **Install Vercel CLI**:

   - `<password>` with your database password   ```bash

   - Add database name: `mongodb+srv://user:pass@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority`   npm install -g vercel

   ```

---

2. **Deploy from frontend directory**:

## Backend Deployment   ```bash

   cd frontend

### Step 1: Push to GitHub   vercel --prod

   ```

```bash

git add .3. **Configure environment variables** in Vercel dashboard:

git commit -m "Production ready - backend deployment"   ```

git push origin main   NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api

```   ```



### Step 2: Create Vercel Project### Alternative: GitHub Integration



1. Go to [vercel.com](https://vercel.com) and log in1. **Connect GitHub repository** to Vercel

2. Click **"Add New..." → "Project"**2. **Set root directory** to `frontend`

3. **Import Git Repository**:3. **Configure build settings**:

   - Find your repository: `Siddharthgautam09/MetaUpSpace`   - Build Command: `npm run build`

   - Click **"Import"**   - Output Directory: `.next`

   - Install Command: `npm install`

### Step 3: Configure Project

## 4. Domain Configuration (Optional)

**Project Name**: `enterprise-task-backend` (or your choice)

### Custom Domains

**Framework Preset**: Other

1. **Railway (Backend)**:

**Root Directory**: Click **"Edit"** → Type `backend` → Save   - Go to Railway project settings

   - Add custom domain

**Build Settings**:   - Configure DNS records (CNAME)

- Build Command: Leave empty or `npm run build`

- Output Directory: Leave empty2. **Vercel (Frontend)**:

- Install Command: `npm install`   - Go to Vercel project settings

   - Add custom domain

### Step 4: Add Environment Variables   - Configure DNS records (CNAME or A record)



Click **"Environment Variables"** and add the following:### SSL Certificates



#### Server ConfigurationBoth Railway and Vercel provide automatic SSL certificates for custom domains.

```

NODE_ENV=production## 5. Production Environment Configuration

PORT=5000

API_VERSION=v1### Backend Production Settings

API_PREFIX=/api

``````typescript

// Update config/index.ts for production

#### Databaseexport const server = {

```  port: parseInt(process.env.PORT || '5000', 10),

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority  nodeEnv: process.env.NODE_ENV || 'production',

```  // ... other settings

*(Replace with your actual MongoDB connection string)*};



#### JWT Configurationexport const database = {

```  mongodb: {

JWT_SECRET=<your-generated-jwt-secret>    uri: process.env.MONGODB_URI, // Atlas connection string

JWT_EXPIRES_IN=7d    options: {

JWT_REFRESH_SECRET=<your-generated-refresh-secret>      maxPoolSize: 10,

JWT_REFRESH_EXPIRES_IN=30d      serverSelectionTimeoutMS: 5000,

```      socketTimeoutMS: 45000,

*(Use secrets generated earlier)*    },

  },

#### Security};

``````

BCRYPT_SALT_ROUNDS=12

SESSION_SECRET=<your-generated-session-secret>### Frontend Production Settings

```

```javascript

#### Rate Limiting// next.config.js

```/** @type {import('next').NextConfig} */

RATE_LIMIT_WINDOW_MS=900000const nextConfig = {

RATE_LIMIT_MAX_REQUESTS=100  output: 'standalone',

```  env: {

    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

#### CORS (Temporary - will update after frontend deployment)  },

```  async headers() {

CORS_ORIGIN=http://localhost:3000    return [

```      {

        source: '/(.*)',

#### Logging        headers: [

```          {

LOG_LEVEL=info            key: 'X-Frame-Options',

```            value: 'DENY',

          },

### Step 5: Deploy          {

            key: 'X-Content-Type-Options',

1. Click **"Deploy"**            value: 'nosniff',

2. Wait for deployment (2-5 minutes)          },

3. Once complete, click **"Visit"** or copy the URL        ],

4. **Save your backend URL**: `https://enterprise-task-backend.vercel.app`      },

    ];

### Step 6: Verify Backend  },

};

Visit: `https://your-backend-url.vercel.app/health````



Expected response:## 6. Monitoring and Logging

```json

{### Railway Monitoring

  "success": true,

  "message": "API is healthy",1. **View logs**: `railway logs`

  "environment": "production",2. **Monitor metrics** in Railway dashboard

  "database": "connected"3. **Set up alerts** for downtime or errors

}

```### Application Monitoring



---```typescript

// Add health check endpoint

## Frontend Deploymentapp.get('/health', (req, res) => {

  res.json({

### Step 1: Create New Vercel Project    status: 'healthy',

    timestamp: new Date().toISOString(),

1. In Vercel dashboard, click **"Add New..." → "Project"**    environment: process.env.NODE_ENV,

2. Import the same GitHub repository    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',

3. Click **"Import"**  });

});

### Step 2: Configure Project```



**Project Name**: `enterprise-task-frontend` (or your choice)## 7. Security Checklist



**Framework Preset**: Next.js (auto-detected)### Backend Security



**Root Directory**: Click **"Edit"** → Type `frontend` → Save- [ ] JWT secrets are cryptographically strong (256-bit)

- [ ] CORS is configured for production domain only

**Build Settings**:- [ ] Rate limiting is enabled

- Build Command: `npm run build`- [ ] Input validation is comprehensive

- Output Directory: `.next`- [ ] MongoDB connection uses authentication

- Install Command: `npm install`- [ ] Logs don't expose sensitive information



### Step 3: Add Environment Variables### Frontend Security



Add the following environment variables:- [ ] API URL points to HTTPS backend

- [ ] No sensitive data in client-side code

```- [ ] CSP headers are configured

NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api- [ ] Dependencies are up to date

NEXT_PUBLIC_APP_NAME=Enterprise Task Management

NEXT_PUBLIC_APP_VERSION=1.0.0## 8. Performance Optimization

```

### Backend Optimization

**Replace `your-backend-url.vercel.app`** with your actual backend URL from the previous step.

```typescript

### Step 4: Deploy// Enable compression

app.use(compression());

1. Click **"Deploy"**

2. Wait for deployment (3-7 minutes)// Optimize MongoDB queries

3. Once complete, click **"Visit"**const projects = await Project.find(filter)

4. **Save your frontend URL**: `https://enterprise-task-frontend.vercel.app`  .populate('managerId', 'firstName lastName email')

  .lean(); // Use lean() for read-only queries

---

// Add database indexes

## Configure CORSProjectSchema.index({ title: 'text', description: 'text' });

ProjectSchema.index({ status: 1, priority: 1 });

Now that both are deployed, update the backend CORS configuration:```



### Step 1: Update Backend Environment Variables### Frontend Optimization



1. Go to your **backend project** in Vercel```typescript

2. Click **Settings** → **Environment Variables**// Enable Image Optimization

3. Find `CORS_ORIGIN` and click **"Edit"**// next.config.js

const nextConfig = {

### Step 2: Set CORS Origins  images: {

    domains: ['your-cdn-domain.com'],

**For single domain:**  },

```};

CORS_ORIGIN=https://enterprise-task-frontend.vercel.app

```// Use dynamic imports for large components

const Dashboard = dynamic(() => import('@/components/Dashboard'), {

**For multiple domains (recommended for preview deployments):**  loading: () => <LoadingSpinner />,

```});

CORS_ORIGIN=https://enterprise-task-frontend.vercel.app,https://enterprise-task-frontend-git-main-yourname.vercel.app,https://enterprise-task-frontend-*.vercel.app```

```

## 9. Backup and Recovery

### Step 3: Redeploy Backend

### Database Backup

1. Go to **Deployments** tab

2. Click on the latest deployment```bash

3. Click **"..."** (three dots) → **"Redeploy"**# MongoDB Atlas automatic backups are enabled by default

4. Select **"Use existing Build Cache"**# For manual backup:

5. Click **"Redeploy"**mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/enterprise_task_management"

```

---

### Code Backup

## Testing Deployment

- Repository is backed up on GitHub

### Test Backend Health- Railway and Vercel maintain deployment history

- Environment variables should be documented securely

Visit: `https://your-backend-url.vercel.app/health`

## 10. Continuous Deployment

Expected: JSON response with `"success": true`

### GitHub Actions (Optional)

### Test Frontend

```yaml

1. Visit your frontend URL# .github/workflows/deploy.yml

2. You should see the login pagename: Deploy to Production

3. Try to login (if you have a user created)

on:

### Test Full Integration  push:

    branches: [main]

1. Open browser DevTools (F12) → Network tab

2. Try logging injobs:

3. Check API requests:  deploy-backend:

   - Should go to your backend URL    runs-on: ubuntu-latest

   - Should return 200 status codes    steps:

   - No CORS errors      - uses: actions/checkout@v3

      - name: Deploy to Railway

### Create First Admin User        run: |

          npm install -g @railway/cli

Use MongoDB Atlas UI or Compass:          railway deploy --service backend



1. Go to MongoDB Atlas → Browse Collections  deploy-frontend:

2. Select `taskmanagement` database → `users` collection    runs-on: ubuntu-latest

3. Click **"Insert Document"**    steps:

4. Add:      - uses: actions/checkout@v3

```json      - name: Deploy to Vercel

{        run: |

  "name": "Admin User",          npm install -g vercel

  "email": "admin@example.com",          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y5MyZYqUXbce",```

  "role": "admin",

  "createdAt": {"$date": "2025-01-01T00:00:00.000Z"},## 11. Testing in Production

  "updatedAt": {"$date": "2025-01-01T00:00:00.000Z"}

}### API Testing

```

*Password hash above is for: `admin123` - CHANGE THIS AFTER FIRST LOGIN*```bash

# Test health endpoint

---curl https://your-backend-domain.railway.app/health



## Troubleshooting# Test authentication

curl -X POST https://your-backend-domain.railway.app/api/auth/login \

### Issue 1: CORS Error  -H "Content-Type: application/json" \

  -d '{"email":"admin@company.com","password":"password123"}'

**Symptom:**```

```

Access to XMLHttpRequest at 'https://backend.vercel.app/api/auth/login' ### Frontend Testing

from origin 'https://frontend.vercel.app' has been blocked by CORS policy

```1. **Test user registration and login**

2. **Verify dashboard loads correctly**

**Solution:**3. **Test project and task creation**

1. Go to backend project → Settings → Environment Variables4. **Verify responsive design on mobile**

2. Edit `CORS_ORIGIN` to include your frontend URL

3. Make sure there are no trailing slashes## 12. Maintenance

4. Redeploy backend

### Regular Updates

### Issue 2: Database Connection Error

- Update dependencies monthly

**Symptom:**- Monitor security advisories

```- Review logs for errors

MongooseServerSelectionError: Could not connect to any servers- Monitor performance metrics

```

### Scaling

**Solution:**

1. Check MongoDB Atlas → Network Access- **Database**: Upgrade MongoDB Atlas tier as needed

2. Ensure 0.0.0.0/0 is whitelisted- **Backend**: Railway auto-scales based on traffic

3. Verify connection string is correct- **Frontend**: Vercel handles scaling automatically

4. Check username/password are URL-encoded

5. Ensure database user has read/write permissions## Support



### Issue 3: 404 on API RoutesFor deployment issues:



**Symptom:**1. **Check logs** in Railway/Vercel dashboards

```2. **Verify environment variables** are set correctly

404 - Not Found on /api/auth/login3. **Test database connectivity** from deployment environment

```4. **Contact support** for platform-specific issues



**Solution:**---

1. Verify `vercel.json` exists in backend folder

2. Check backend Root Directory is set to `backend`**Deployment completed! Your enterprise task management system is now live in production.**
3. Verify API_PREFIX is set to `/api`
4. Redeploy backend

### Issue 4: Build Fails

**Symptom:**
```
Error: Build failed with exit code 1
```

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `next` is in frontend dependencies
3. Verify Root Directory is correct
4. Test build locally: `npm run build`
5. Check for TypeScript errors

### Issue 5: Environment Variables Not Working

**Symptom:**
- Variables are undefined
- API calls fail

**Solution:**
1. Frontend: Ensure variables have `NEXT_PUBLIC_` prefix
2. After adding variables, redeploy the project
3. Check Variables are set for "Production" environment
4. Clear cache: Go to Deployments → Redeploy without cache

---

## Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads without errors
- [ ] Login works end-to-end
- [ ] No CORS errors in console
- [ ] Database connection successful
- [ ] Admin user created
- [ ] All pages accessible
- [ ] API documentation accessible (`/api/docs`)

---

## Custom Domain Setup (Optional)

### Add Domain to Frontend

1. Go to frontend project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS instructions
5. Wait for SSL certificate (automatic)

### Add Domain to Backend

1. Go to backend project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS instructions

### Update Environment Variables

After adding custom domains:

**Backend:**
- Update `CORS_ORIGIN` to include custom frontend domain

**Frontend:**
- Update `NEXT_PUBLIC_API_URL` to custom backend domain

Then redeploy both projects.

---

## Monitoring & Maintenance

### Recommended Tools

- **Error Tracking**: [Sentry](https://sentry.io)
- **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com)
- **Analytics**: Vercel Analytics (built-in)
- **Database**: MongoDB Atlas Monitoring (built-in)

### Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Update dependencies (`npm audit`)
- **Quarterly**: Review and rotate secrets

---

## Rollback Procedure

If something goes wrong:

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Find the last working deployment
4. Click **"..."** → **"Promote to Production"**

---

## Production URLs

After deployment, save these URLs:

```
Frontend: https://enterprise-task-frontend.vercel.app
Backend:  https://enterprise-task-backend.vercel.app
API Docs: https://enterprise-task-backend.vercel.app/api/docs
Health:   https://enterprise-task-backend.vercel.app/health
```

---

## Security Recommendations

✅ **Completed:**
- HTTPS enabled (automatic with Vercel)
- Strong JWT secrets generated
- CORS properly configured
- Rate limiting enabled
- Password hashing (bcrypt)
- Security headers (Helmet.js)

📋 **Next Steps:**
- Set up error monitoring (Sentry)
- Configure automated backups (MongoDB Atlas)
- Enable 2FA for admin accounts
- Set up alerting for critical errors
- Regular security audits

---

**🎉 Congratulations! Your Enterprise Task Management System is now live in production!**

For issues or questions, check the main [README.md](./README.md) or open an issue on GitHub.
