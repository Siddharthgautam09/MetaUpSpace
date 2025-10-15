# ⚡ Vercel Deployment - Quick Reference

## 🚀 Quick Deploy (Copy-Paste Commands)

### 1. Push to GitHub
```bash
cd d:/Task/enterprise-task-management
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. MongoDB Connection String Template
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/taskmanagement?retryWrites=true&w=majority
```

---

## 📝 Environment Variables

### Backend Environment Variables (Copy-Paste to Vercel)

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
JWT_SECRET=18036421b7832857a13c095ce9619620743fd2809f1cc589f7168494ec453305
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dac2ed30c45981e148246f83b446ec6690cf73ca9050a9aeac6b0bb74d805751
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info
PORT=5000
```

### Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## 🔑 Vercel Project Settings

### Backend Project
- **Framework**: Other
- **Root Directory**: `backend`
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

### Frontend Project
- **Framework**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## 🔗 Important URLs After Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://[project].vercel.app` | Main application |
| Backend API | `https://[project].vercel.app` | API endpoints |
| API Docs | `https://[backend].vercel.app/api/docs` | Swagger documentation |
| Health Check | `https://[backend].vercel.app/health` | API status |

---

## 🧪 Test Commands

### Test Backend Health
```bash
curl https://your-backend.vercel.app/health
```

### Test Backend API
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Test Login
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 🐛 Quick Troubleshooting

### CORS Error
```bash
# Issue: "Access blocked by CORS policy"
# Fix: Update backend CORS_ORIGIN environment variable
CORS_ORIGIN=http://localhost:3000,https://your-actual-frontend.vercel.app
# Then redeploy backend
```

### Database Connection Failed
```bash
# Check these:
1. MongoDB Atlas Network Access: 0.0.0.0/0 is whitelisted
2. Connection string is correct
3. Password is URL-encoded
4. Database name is included in connection string
```

### 404 on API Routes
```bash
# Check:
1. Backend Root Directory = "backend"
2. vercel.json exists in backend folder
3. Redeploy the backend project
```

### Build Failed
```bash
# Solutions:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies in package.json
3. Clear cache and redeploy
```

---

## 🔄 Update Deployment

### Auto Deploy (Recommended)
```bash
# Just push changes
git add .
git commit -m "Your update message"
git push origin main
# Vercel automatically deploys!
```

### Manual Redeploy
1. Go to Vercel Dashboard
2. Select your project
3. **Deployments** tab
4. Click **"..."** on latest deployment
5. Click **"Redeploy"**

---

## 👤 Create Admin User (MongoDB Atlas)

1. Go to MongoDB Atlas → **Browse Collections**
2. Database: `taskmanagement` → Collection: `users`
3. Click **"Insert Document"**
4. Paste:

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

**Login**: admin@example.com / admin123

---

## 📊 Monitoring & Logs

### View Backend Logs
1. Backend Project → **Deployments**
2. Click latest deployment
3. **View Function Logs**

### View Frontend Logs
1. Frontend Project → **Deployments**
2. Click latest deployment
3. Check runtime logs

### MongoDB Monitoring
1. MongoDB Atlas → Your Cluster
2. **Metrics** tab
3. Monitor connections and operations

---

## ✅ Deployment Checklist

```
□ Code pushed to GitHub
□ MongoDB Atlas cluster created
□ Database user created
□ Network access configured (0.0.0.0/0)
□ Backend deployed on Vercel
□ Backend environment variables set
□ Frontend deployed on Vercel
□ Frontend NEXT_PUBLIC_API_URL set
□ CORS updated with frontend URL
□ Backend redeployed after CORS update
□ Admin user created
□ Login tested successfully
□ No errors in browser console
□ API documentation accessible
```

---

## 🎯 Quick Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| MongoDB Atlas | https://cloud.mongodb.com |
| GitHub Repo | https://github.com/Siddharthgautam09/MetaUpSpace |
| Vercel Docs | https://vercel.com/docs |
| MongoDB Docs | https://docs.mongodb.com |

---

## 💡 Pro Tips

### Faster Deployments
- Push small, focused commits
- Use `[skip ci]` in commit message to skip deployment
- Enable auto-deployments for main branch only

### Better Performance
- Enable Vercel Edge Functions
- Use Vercel Analytics
- Enable Speed Insights
- Set up caching headers

### Security
- Rotate JWT secrets regularly
- Use strong database passwords
- Enable Vercel Password Protection for staging
- Set up Vercel Firewall rules

### Cost Optimization
- Use Vercel Hobby plan (free)
- Monitor function execution time
- Use MongoDB Atlas free tier (M0)
- Optimize API response sizes

---

## 🆘 Emergency Procedures

### Rollback Deployment
1. Vercel Dashboard → Project
2. **Deployments** tab
3. Find last working deployment
4. Click **"..."** → **"Promote to Production"**

### Database Backup
1. MongoDB Atlas → Your Cluster
2. **Backup** tab
3. Enable automatic backups
4. Or manually export collections

### Check System Status
- Vercel Status: https://www.vercel-status.com
- MongoDB Status: https://status.mongodb.com

---

## 🎓 Additional Resources

### Tutorials
- [Vercel Next.js Deployment](https://vercel.com/guides/deploying-nextjs-with-vercel)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)

### Video Guides
- [Vercel Deployment Basics](https://vercel.com/docs/concepts/deployments/overview)
- [MongoDB Atlas Tutorial](https://www.mongodb.com/docs/atlas/tutorial/)

---

**Time to Deploy: ~15 minutes** ⏱️

**For detailed walkthrough, see:** [`VERCEL_DEPLOYMENT_GUIDE.md`](VERCEL_DEPLOYMENT_GUIDE.md)

---

**Last Updated:** October 15, 2025
**Status:** ✅ Ready to Deploy
