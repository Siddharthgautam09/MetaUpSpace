# 🚀 Complete Vercel Deployment Guide

## Overview
This guide will help you deploy both your **Backend API** and **Frontend** to Vercel in under 15 minutes.

---

## 📋 What You Need

- ✅ GitHub account (code must be pushed)
- ✅ Vercel account (free) - https://vercel.com
- ✅ MongoDB Atlas account (free) - https://mongodb.com/atlas
- ✅ 15 minutes of your time

---

## Part 1: Setup MongoDB Atlas (5 minutes)

### Step 1: Create MongoDB Cluster

1. Go to https://cloud.mongodb.com and sign up/login
2. Click **"Build a Database"** or **"Create"**
3. Choose **"M0 FREE"** tier
4. Select cloud provider (AWS recommended) and region (closest to you)
5. Cluster Name: `TaskManagementCluster`
6. Click **"Create"** and wait 2-3 minutes

### Step 2: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `taskadmin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (required for Vercel)
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. **Copy the connection string**, it looks like:
   ```
   mongodb+srv://taskadmin:<password>@taskmanagementcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual password
7. **Add database name** before the `?`:
   ```
   mongodb+srv://taskadmin:YourPassword@taskmanagementcluster.xxxxx.mongodb.net/taskmanagement?retryWrites=true&w=majority
   ```
8. **SAVE THIS** - you'll need it in Step 2!

---

## Part 2: Deploy Backend to Vercel (5 minutes)

### Step 1: Push Code to GitHub

If you haven't already:

```bash
cd d:/Task/enterprise-task-management
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Create Backend Project on Vercel

1. Go to https://vercel.com and login
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Find `Siddharthgautam09/MetaUpSpace`
   - Click **"Import"**

### Step 3: Configure Backend Project

**Project Settings:**
- **Project Name**: `enterprise-task-backend` (or your choice)
- **Framework Preset**: **Other**
- **Root Directory**: Click **"Edit"** → Type `backend` → **Save**

**Build & Output Settings:**
- Build Command: Leave empty
- Output Directory: Leave empty
- Install Command: `npm install`
- Development Command: Leave empty

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these one by one:

```
NODE_ENV
production

MONGODB_URI
mongodb+srv://taskadmin:YourPassword@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority

JWT_SECRET
18036421b7832857a13c095ce9619620743fd2809f1cc589f7168494ec453305

JWT_EXPIRES_IN
7d

JWT_REFRESH_SECRET
dac2ed30c45981e148246f83b446ec6690cf73ca9050a9aeac6b0bb74d805751

JWT_REFRESH_EXPIRES_IN
30d

CORS_ORIGIN
http://localhost:3000,https://meta-up-space-v7mb.vercel.app

API_VERSION
v1

API_PREFIX
/api

LOG_LEVEL
info

PORT
5000
```

**Important:** Replace `MONGODB_URI` with your actual connection string from Part 1!

### Step 5: Deploy Backend

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Once done, you'll see: **"Congratulations! Your project has been deployed."**
4. **Copy your backend URL**: `https://enterprise-task-backend.vercel.app`

### Step 6: Test Backend

1. Click **"Visit"** or open your backend URL
2. You should see JSON response:
   ```json
   {
     "success": true,
     "message": "API is healthy"
   }
   ```

3. **Test API documentation**:
   - Visit: `https://your-backend-url.vercel.app/api/docs`
   - You should see Swagger UI

✅ **Backend is live!**

---

## Part 3: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Frontend Project on Vercel

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. **Import** the same repository: `Siddharthgautam09/MetaUpSpace`
3. Click **"Import"**

### Step 2: Configure Frontend Project

**Project Settings:**
- **Project Name**: `enterprise-task-frontend` (or your choice)
- **Framework Preset**: **Next.js** (auto-detected)
- **Root Directory**: Click **"Edit"** → Type `frontend` → **Save**

**Build & Output Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 3: Add Frontend Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL
https://enterprise-task-backend.vercel.app
```

**Replace with your actual backend URL from Part 2!**

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment
3. Once done, **copy your frontend URL**: `https://enterprise-task-frontend.vercel.app`

### Step 5: Update Backend CORS

1. Go back to **Backend project** in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Find **`CORS_ORIGIN`**
4. Click **"Edit"**
5. Update the value to include your frontend URL:
   ```
   http://localhost:3000,https://enterprise-task-frontend.vercel.app
   ```
6. Click **"Save"**

### Step 6: Redeploy Backend

1. Go to backend **"Deployments"** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

✅ **Frontend is live!**

---

## Part 4: Create First User

### Option 1: Via MongoDB Atlas

1. Go to MongoDB Atlas → **"Browse Collections"**
2. Database: `taskmanagement` → Collection: `users`
3. Click **"Insert Document"**
4. Paste this:

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

**Login credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### Option 2: Via API (Recommended)

Use Swagger UI:
1. Go to: `https://your-backend.vercel.app/api/docs`
2. Find **POST /api/auth/register**
3. Click **"Try it out"**
4. Enter your details
5. Click **"Execute"**

---

## Part 5: Test Everything

### 1. Test Frontend

1. Visit your frontend URL: `https://enterprise-task-frontend.vercel.app`
2. You should see the login page
3. Login with admin credentials
4. Test creating a project/task

### 2. Check Browser Console

1. Press F12 → Console tab
2. Should see **NO CORS errors**
3. Should see successful API calls

### 3. Test API Documentation

1. Visit: `https://your-backend.vercel.app/api/docs`
2. Click **"Authorize"**
3. Login to get a token
4. Test endpoints with **"Try it out"**

---

## 🎉 Deployment Complete!

### Your URLs

Save these URLs:

```
Frontend:  https://enterprise-task-frontend.vercel.app
Backend:   https://enterprise-task-backend.vercel.app
API Docs:  https://enterprise-task-backend.vercel.app/api/docs
Health:    https://enterprise-task-backend.vercel.app/health
```

---

## 🔧 Common Issues & Solutions

### Issue 1: CORS Error in Browser

**Error:** `Access blocked by CORS policy`

**Solution:**
1. Go to Backend project → Settings → Environment Variables
2. Update `CORS_ORIGIN` to include frontend URL
3. Redeploy backend

### Issue 2: Database Connection Failed

**Error:** `MongooseServerSelectionError`

**Solutions:**
1. Check MongoDB Network Access allows `0.0.0.0/0`
2. Verify connection string is correct
3. Check database user credentials
4. Ensure password is URL-encoded (no special chars)

### Issue 3: 404 on API Routes

**Error:** All API calls return 404

**Solutions:**
1. Verify Root Directory is set to `backend`
2. Check `vercel.json` exists in backend folder
3. Redeploy project

### Issue 4: Build Failed

**Error:** Deployment shows "Build Error"

**Solutions:**
1. Check build logs in Vercel
2. Ensure all dependencies are in `package.json`
3. Try deploying again

### Issue 5: Frontend Shows "API Unreachable"

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Test backend health endpoint
3. Check browser console for specific errors

---

## 📊 Monitoring

### View Logs

**Backend Logs:**
1. Backend Project → **"Deployments"**
2. Click latest deployment
3. Click **"View Function Logs"**

**Frontend Logs:**
1. Frontend Project → **"Deployments"**
2. Click latest deployment
3. Check build and runtime logs

### Monitor Database

1. MongoDB Atlas → Your Cluster
2. Click **"Metrics"** tab
3. View:
   - Connections
   - Operations per second
   - Storage usage

---

## 🔄 Making Updates

### Update Backend

```bash
# Make changes
git add .
git commit -m "Update backend feature"
git push origin main
# Vercel auto-deploys!
```

### Update Frontend

```bash
# Make changes
git add .
git commit -m "Update frontend feature"
git push origin main
# Vercel auto-deploys!
```

### Manual Redeploy

1. Go to project in Vercel
2. **Deployments** tab
3. Click **"..."** on any deployment
4. Click **"Redeploy"**

---

## 🎯 Next Steps

1. ✅ **Change Admin Password** (security!)
2. ✅ **Add Custom Domain** (optional)
3. ✅ **Enable Vercel Analytics** (free)
4. ✅ **Set up Error Monitoring** (Sentry)
5. ✅ **Create More Users** via UI
6. ✅ **Share with Team**

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **GitHub Issues**: Open an issue in your repo
- **Community**: Vercel Discord

---

## 📝 Checklist

Before going to production:

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] CORS configured correctly
- [ ] Database connected
- [ ] Admin user created
- [ ] Login works end-to-end
- [ ] No errors in browser console
- [ ] API documentation accessible
- [ ] All features tested
- [ ] Environment variables secured

---

**Congratulations! 🎉 Your Enterprise Task Management System is now live on Vercel!**

**Questions?** Refer to troubleshooting section above or check Vercel documentation.
