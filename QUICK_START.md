# ⚡ Quick Start Guide

Get your Enterprise Task Management System running in production in under 30 minutes!

## 🎯 Overview

This guide will help you deploy both frontend and backend to Vercel with MongoDB Atlas.

---

## 📋 What You Need

- GitHub account (with your code pushed)
- [Vercel account](https://vercel.com) (free)
- [MongoDB Atlas account](https://mongodb.com/atlas) (free)
- 30 minutes of your time

---

## 🚀 Step-by-Step Deployment

### 1️⃣ Generate Secrets (2 minutes)

Open terminal and run:

```bash
# Copy these outputs - you'll need them!
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Save these values somewhere safe!**

---

### 2️⃣ Setup MongoDB Atlas (5 minutes)

1. Go to [MongoDB Atlas](https://mongodb.com/atlas) → Sign up/Login
2. Click **"Create"** → **"Cluster"** (choose Free M0 tier)
3. While cluster is creating:
   - Go to **Database Access** → Add user (save username & password)
   - Go to **Network Access** → Add IP: `0.0.0.0/0`
4. Once cluster ready:
   - Click **"Connect"** → **"Connect your application"**
   - Copy connection string
   - Replace `<username>`, `<password>`, add database name:
     ```
     mongodb+srv://user:pass@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
     ```

**Save this connection string!**

---

### 3️⃣ Deploy Backend to Vercel (8 minutes)

1. Go to [vercel.com](https://vercel.com) → Login with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository: `Siddharthgautam09/MetaUpSpace`
4. **Configure**:
   - Project Name: `enterprise-task-backend`
   - Root Directory: `backend` ⚠️
   - Framework: Other
5. **Environment Variables** (click "Add"):

   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generated-jwt-secret>
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=<generated-refresh-secret>
   JWT_REFRESH_EXPIRES_IN=30d
   BCRYPT_SALT_ROUNDS=12
   SESSION_SECRET=<generated-session-secret>
   CORS_ORIGIN=http://localhost:3000
   LOG_LEVEL=info
   API_VERSION=v1
   API_PREFIX=/api
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. **Copy your backend URL**: `https://enterprise-task-backend.vercel.app`

**Test**: Visit `https://your-backend-url.vercel.app/health` → Should see JSON

---

### 4️⃣ Deploy Frontend to Vercel (5 minutes)

1. In Vercel, click **"Add New..."** → **"Project"**
2. Import same repository again
3. **Configure**:
   - Project Name: `enterprise-task-frontend`
   - Root Directory: `frontend` ⚠️
   - Framework: Next.js (auto-detected)
4. **Environment Variables**:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   NEXT_PUBLIC_APP_NAME=Enterprise Task Management
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

   ⚠️ Replace `your-backend-url` with actual URL from step 3!

5. Click **"Deploy"**
6. Wait 3-5 minutes
7. **Copy your frontend URL**: `https://enterprise-task-frontend.vercel.app`

---

### 5️⃣ Fix CORS (3 minutes)

1. Go to your **backend project** in Vercel
2. **Settings** → **Environment Variables**
3. Find `CORS_ORIGIN` → Click **"Edit"**
4. Change to:
   ```
   https://enterprise-task-frontend.vercel.app
   ```
   (Use your actual frontend URL!)
5. **Deployments** → Latest → **"..."** → **"Redeploy"**

---

### 6️⃣ Create Admin User (5 minutes)

1. Go to MongoDB Atlas → **Browse Collections**
2. Database: `taskmanagement` → Collection: `users`
3. Click **"Insert Document"**
4. Paste this (change email if you want):

   ```json
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y5MyZYqUXbce",
     "role": "admin",
     "createdAt": {"$date": "2025-01-01T00:00:00.000Z"},
     "updatedAt": {"$date": "2025-01-01T00:00:00.000Z"}
   }
   ```

5. Click **"Insert"**

**Login credentials**:
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change password immediately after first login!

---

### 7️⃣ Test Everything (2 minutes)

1. Visit your frontend URL
2. You should see the login page
3. Login with admin credentials
4. Check browser console (F12) → Should be no errors
5. Navigate to Dashboard, Projects, Tasks

**✅ If everything works → You're done!**

---

## 🎉 Success!

Your app is now live at:
- **Frontend**: `https://enterprise-task-frontend.vercel.app`
- **Backend**: `https://enterprise-task-backend.vercel.app`
- **API Docs**: `https://enterprise-task-backend.vercel.app/api/docs`

---

## 🆘 Troubleshooting

### ❌ CORS Error in Browser Console

**Problem**: `Access blocked by CORS policy`

**Fix**:
1. Backend project → Settings → Environment Variables
2. Edit `CORS_ORIGIN` → Add your frontend URL
3. Redeploy backend

---

### ❌ Can't Connect to Database

**Problem**: `MongooseServerSelectionError`

**Fix**:
1. MongoDB Atlas → Network Access
2. Ensure `0.0.0.0/0` is added
3. Check connection string is correct
4. Verify database user exists

---

### ❌ 404 on API Routes

**Problem**: All API calls return 404

**Fix**:
1. Backend project → Settings → General
2. Verify Root Directory is `backend`
3. Redeploy

---

### ❌ Build Failed

**Problem**: Deployment shows "Build failed"

**Fix**:
1. Check build logs in Vercel
2. Ensure Root Directory is correct
3. For frontend: Should be `frontend`
4. For backend: Should be `backend`

---

## 📚 Next Steps

1. **Change admin password** (security!)
2. **Add custom domain** (optional)
3. **Create more users** via UI
4. **Explore features**: Projects, Tasks, Analytics
5. **Set up monitoring** (Sentry, UptimeRobot)

---

## 📖 More Help

- **Full Documentation**: `README.md`
- **Detailed Deployment**: `DEPLOYMENT.md`
- **Production Checklist**: `PRODUCTION_CHECKLIST.md`

---

## ⏱️ Time Breakdown

- Secrets: 2 min ✓
- MongoDB: 5 min ✓
- Backend: 8 min ✓
- Frontend: 5 min ✓
- CORS: 3 min ✓
- Admin User: 5 min ✓
- Testing: 2 min ✓

**Total: ~30 minutes** 🎉

---

**Made with ❤️ - Now go build something amazing!**
