# 🧪 API Testing Guide

## Backend Deployment URLs

**Production Backend:** `https://meta-up-space-kawp.vercel.app`
**Frontend:** `https://meta-up-space-v7mb.vercel.app`

---

## 📍 Available Endpoints

### 1. Root / Welcome
```bash
GET https://meta-up-space-kawp.vercel.app/
```
**Response:** API information and available endpoints

### 2. Health Check
```bash
GET https://meta-up-space-kawp.vercel.app/health
```
**Response:** Server health status and database connection

### 3. API Info
```bash
GET https://meta-up-space-kawp.vercel.app/api
```
**Response:** API version and endpoint list

### 4. API Documentation (Swagger)
```bash
GET https://meta-up-space-kawp.vercel.app/api/docs
```
**Access:** Interactive API documentation

---

## 🔐 Authentication Endpoints

### Register New User
```bash
POST https://meta-up-space-kawp.vercel.app/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "employee"
}
```

### Login
```bash
POST https://meta-up-space-kawp.vercel.app/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response includes:**
- `accessToken` - Use this in Authorization header
- `refreshToken` - Use to get new access token

### Get Current User Profile
```bash
GET https://meta-up-space-kawp.vercel.app/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📊 Project Endpoints

### Get All Projects
```bash
GET https://meta-up-space-kawp.vercel.app/api/projects
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Create New Project
```bash
POST https://meta-up-space-kawp.vercel.app/api/projects
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "active",
  "startDate": "2025-10-15",
  "endDate": "2025-12-31",
  "teamMembers": []
}
```

### Get Single Project
```bash
GET https://meta-up-space-kawp.vercel.app/api/projects/:projectId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## ✅ Task Endpoints

### Get All Tasks
```bash
GET https://meta-up-space-kawp.vercel.app/api/tasks
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assignedTo` - Filter by user ID
- `project` - Filter by project ID

### Create New Task
```bash
POST https://meta-up-space-kawp.vercel.app/api/tasks
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Design homepage mockup",
  "description": "Create mockup for new homepage design",
  "status": "pending",
  "priority": "high",
  "project": "PROJECT_ID_HERE",
  "assignedTo": "USER_ID_HERE",
  "dueDate": "2025-10-30"
}
```

### Update Task
```bash
PUT https://meta-up-space-kawp.vercel.app/api/tasks/:taskId
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "urgent"
}
```

---

## 📈 Analytics Endpoints

### Get Dashboard Analytics
```bash
GET https://meta-up-space-kawp.vercel.app/api/analytics/dashboard
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response includes:**
- Total tasks, projects, users
- Task statistics by status
- Project statistics
- Recent activities

### Get Task Analytics
```bash
GET https://meta-up-space-kawp.vercel.app/api/analytics/tasks
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Project Analytics
```bash
GET https://meta-up-space-kawp.vercel.app/api/analytics/projects
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🧪 Testing with cURL

### Test Root Endpoint
```bash
curl https://meta-up-space-kawp.vercel.app/
```

### Test Health Check
```bash
curl https://meta-up-space-kawp.vercel.app/health
```

### Test Login
```bash
curl -X POST https://meta-up-space-kawp.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Test with Authentication
```bash
curl -X GET https://meta-up-space-kawp.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Testing with JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('https://meta-up-space-kawp.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123',
  }),
});

const { accessToken } = await loginResponse.json();

// Get tasks with authentication
const tasksResponse = await fetch('https://meta-up-space-kawp.vercel.app/api/tasks', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const tasks = await tasksResponse.json();
console.log(tasks);
```

---

## ⚙️ Environment Variables Needed in Vercel

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```env
MONGODB_URI=mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask
JWT_SECRET=18036421b7832857a13c095ce9619620743fd2809f1cc589f7168494ec453305
JWT_REFRESH_SECRET=dac2ed30c45981e148246f83b446ec6690cf73ca9050a9aeac6b0bb74d805751
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000,https://meta-up-space-v7mb.vercel.app
```

---

## 🔍 Common Issues

### 401 Unauthorized
- Check if you're including the Authorization header
- Verify the token hasn't expired
- Try logging in again to get a fresh token

### 404 Not Found
- Double-check the endpoint URL
- Make sure you're using `/api/` prefix for most routes
- Verify the resource ID exists (for endpoints like `/api/tasks/:taskId`)

### 500 Internal Server Error
- Check Vercel logs: Dashboard → Backend Project → Logs
- Verify environment variables are set
- Check MongoDB connection

### CORS Error
- Verify `CORS_ORIGIN` environment variable includes your frontend URL
- Check if you're making requests from an allowed origin

---

## 📝 Next Steps

1. **Add Environment Variables** (if not done yet)
2. **Test Root Endpoint** - Should return welcome message
3. **Test Health Check** - Should show database status
4. **Test Login** - Create/login with a user
5. **Deploy Frontend** - Connect frontend to backend
6. **End-to-End Testing** - Test full user flow

---

## 🚀 Ready to Deploy Frontend?

Once backend is working:
1. Update frontend API URL to: `https://meta-up-space-kawp.vercel.app`
2. Deploy frontend to Vercel (root directory: `frontend`)
3. Test the complete application!
