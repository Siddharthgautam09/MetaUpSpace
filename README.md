# 🚀 Enterprise Task Management System

A comprehensive, production-ready task management system built with modern web technologies. This full-stack application provides advanced project management, task tracking, analytics, and collaboration features for enterprise environments.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Admin, Manager, Member)
- **Project Management**: Create, update, and manage projects with team assignments
- **Task Management**: Comprehensive task tracking with priorities, statuses, and assignments
- **Dashboard Analytics**: Real-time insights with interactive charts and statistics
- **User Management**: Admin panel for managing team members and roles
- **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS
- **Real-time Updates**: Instant notifications and data synchronization

### Technical Features
- **Security**: Helmet.js for security headers, bcrypt for password hashing, CORS protection
- **Performance**: Compression middleware, rate limiting, optimized database queries
- **Error Handling**: Comprehensive error boundaries and global error handling
- **Logging**: Winston-based logging system with multiple log levels
- **API Documentation**: Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript implementation across frontend and backend

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (optional)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Winston + Morgan
- **Documentation**: Swagger

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │────────▶│  Express.js     │────────▶│  MongoDB        │
│  Frontend       │  HTTP   │  Backend API    │  Mongoose│  Database      │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    │
                                    ▼
                            ┌─────────────────┐
                            │                 │
                            │  Redis Cache    │
                            │  (Optional)     │
                            │                 │
                            └─────────────────┘
```

### Design Patterns
- **MVC Architecture**: Separation of concerns with Models, Views (Frontend), and Controllers
- **Repository Pattern**: Data access abstraction through Mongoose models
- **Middleware Pattern**: Request processing pipeline for authentication, validation, and error handling
- **Factory Pattern**: Service creation and dependency injection

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **MongoDB**: v6.0 or higher ([Download](https://www.mongodb.com/try/download/community)) or MongoDB Atlas account
- **Redis** (Optional): v7.0 or higher ([Download](https://redis.io/download))
- **Git**: For version control ([Download](https://git-scm.com/))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Siddharthgautam09/MetaUpSpace.git
cd MetaUpSpace
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**:
```bash
cd backend
cp .env.example .env
```

2. **Configure Environment Variables** (edit `.env`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1
API_PREFIX=/api

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/enterprise_task_management
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend Configuration

1. **Create Environment File**:
```bash
cd frontend
cp .env.example .env.local
```

2. **Configure Environment Variables** (edit `.env.local`):

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Settings
NEXT_PUBLIC_APP_NAME=Enterprise Task Management
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🏃 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

#### Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Production Build

#### Build Backend

```bash
cd backend
npm run build
npm start
```

#### Build Frontend

```bash
cd frontend
npm run build
npm start
```

## 🌐 Deployment

### Deploying to Vercel

#### Frontend Deployment

1. **Push Your Code to GitHub**:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - **Configure Project Settings**:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Add Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
     ```

#### Backend Deployment

1. **Deploy via Vercel Dashboard**:
   - Create a new project for backend
   - Import the same GitHub repository
   - **Configure Project Settings**:
     - **Root Directory**: `backend`
     - **Build Command**: `npm run build` or leave empty
     - **Output Directory**: Leave empty

2. **Add Environment Variables in Vercel**:
   - Add all variables from `.env.example`
   - **Critical Variables**:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
     JWT_SECRET=your-generated-secret-key
     JWT_REFRESH_SECRET=your-generated-refresh-secret-key
     CORS_ORIGIN=https://your-frontend-url.vercel.app
     ```
   - For multiple frontend URLs (including preview deployments):
     ```
     CORS_ORIGIN=https://your-app.vercel.app,https://your-app-*.vercel.app
     ```

3. **Update Frontend Environment**:
   - Go back to frontend project settings
   - Update `NEXT_PUBLIC_API_URL` with your backend Vercel URL
   - Redeploy frontend

### Important: CORS Configuration for Vercel

Since Vercel creates preview deployments, you need to allow multiple origins:

**Option 1: Specific domains**
```env
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

**Option 2: Using environment variable for dynamic origins**
In your backend code, the CORS is already configured to split comma-separated origins in production.

### Deploying to Other Platforms

#### Railway.app

1. **Backend**:
   - Connect GitHub repository
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

2. **Frontend**:
   - Create new service
   - Set root directory to `frontend`
   - Add `NEXT_PUBLIC_API_URL`
   - Deploy

#### Render.com

Similar to Railway, create separate web services for frontend and backend.

### Docker Deployment

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

## 📚 API Documentation

Once the backend is running, access the Swagger API documentation at:

```
http://localhost:5000/api/docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/projects` - Get project statistics
- `GET /api/analytics/tasks` - Get task statistics

#### Users
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

## 📁 Project Structure

```
enterprise-task-management/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── utils/              # Utility functions
│   │   └── app.ts              # Express app setup
│   ├── config/                 # Configuration files
│   ├── logs/                   # Application logs
│   ├── .env.example            # Environment variables template
│   ├── vercel.json             # Vercel deployment config
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js app router
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── projects/       # Projects page
│   │   │   ├── tasks/          # Tasks page
│   │   │   ├── analytics/      # Analytics page
│   │   │   └── login/          # Login page
│   │   ├── components/         # Reusable components
│   │   ├── context/            # React context providers
│   │   ├── lib/                # Utilities and API client
│   │   └── types/              # TypeScript types
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment variables template
│   ├── next.config.js          # Next.js configuration
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔐 Security Best Practices

### For Production Deployment

1. **Change All Default Secrets**:
   ```bash
   # Generate strong JWT secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Enable HTTPS**:
   - Vercel provides HTTPS automatically
   - For custom domains, configure SSL certificates

3. **Set Proper CORS Origins**:
   - Only allow your frontend domain(s)
   - Never use `*` in production
   - Example: `CORS_ORIGIN=https://your-app.vercel.app`

4. **Use Environment Variables**:
   - Never commit `.env` files
   - Use platform-specific secrets management

5. **Rate Limiting**:
   - Configure appropriate rate limits
   - Monitor and adjust based on traffic

6. **Database Security**:
   - Use strong MongoDB passwords
   - Enable MongoDB authentication
   - Restrict network access with IP whitelisting (MongoDB Atlas)

7. **Regular Updates**:
   ```bash
   npm audit
   npm audit fix
   ```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🆘 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```
**Solution**:
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For MongoDB Atlas, verify IP whitelist and credentials

#### 2. CORS Errors
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**:
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- For Vercel deployments, include all preview URLs
- Example: `CORS_ORIGIN=https://app.vercel.app,https://app-*.vercel.app`

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
- Change `PORT` in backend `.env`
- Or kill the process: `npx kill-port 5000`

#### 4. Build Errors on Vercel
```
Error: No Next.js version detected
```
**Solution**:
- Ensure `Root Directory` is set to `frontend`
- Verify `next` is in `package.json` dependencies

#### 5. Environment Variables Not Working
**Solution**:
- For frontend: Use `NEXT_PUBLIC_` prefix
- Redeploy after adding environment variables
- Clear cache: `vercel --force`

## 📊 Performance Optimization

### Backend
- ✅ Compression middleware enabled
- ✅ Rate limiting configured
- ✅ Database query optimization with indexes
- ✅ Response caching with Redis (optional)

### Frontend
- ✅ Next.js automatic code splitting
- ✅ Image optimization with Next.js Image component
- ✅ Static page generation where possible
- ✅ Error boundaries for graceful error handling

## 📞 Support

For issues, questions, or contributions:

- **GitHub Issues**: [Open an issue](https://github.com/Siddharthgautam09/MetaUpSpace/issues)
- **Email**: siddharthgautam@example.com
- **Documentation**: See inline code comments and Swagger docs

## 🎯 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] File upload and storage integration
- [ ] Advanced reporting and data export
- [ ] Mobile app (React Native)
- [ ] Integrations (Slack, Email, Calendar)
- [ ] Automated testing suite
- [ ] CI/CD pipeline

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the robust database
- Vercel for seamless deployment
- Open-source community for invaluable tools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Siddharth Gautam**

### Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/Siddharthgautam09/MetaUpSpace.git
cd MetaUpSpace

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

Visit `http://localhost:3000` to see the application! 🎉
