# Enterprise Task Management System

A comprehensive task management system built with Next.js, Node.js, and MongoDB, designed for enterprise-level project and task management.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, update, and manage projects with deadlines, priorities, and team assignments
- **Task Management**: Full CRUD operations for tasks with status tracking, dependencies, and comments
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Role-Based Permissions**: Three user roles - Admin, Manager, and Team Member
- **Real-time Dashboard**: Analytics and insights with charts and metrics
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Advanced Features
- **Analytics & Reporting**: Comprehensive dashboard with project/task statistics
- **Team Collaboration**: Task assignments, comments, and team member workload tracking
- **Search & Filtering**: Advanced filtering and search capabilities
- **File Attachments**: Support for task and project attachments
- **Audit Logging**: Complete activity tracking and logging
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt for password hashing
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast

### DevOps & Deployment
- **Database**: MongoDB Atlas (production)
- **Backend Deployment**: Railway/Render
- **Frontend Deployment**: Vercel/Netlify
- **Environment Management**: dotenv

## 📁 Project Structure

```
enterprise-task-management/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── app.ts         # Express app setup
│   ├── config/            # Configuration files
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── types/         # TypeScript type definitions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd enterprise-task-management
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   - Start MongoDB locally or use MongoDB Atlas
   - Update MONGODB_URI in backend/.env

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/enterprise_task_management
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## � Production Deployment

### Backend Deployment (Railway)

1. **Prepare for deployment**
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy to Railway**
   - Connect your GitHub repository to Railway
   - Set environment variables in Railway dashboard
   - Deploy automatically on push to main branch

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd frontend
   npx vercel --prod
   ```

2. **Environment Variables**
   - Set NEXT_PUBLIC_API_URL to your production backend URL

### Database (MongoDB Atlas)

1. **Create MongoDB Atlas cluster**
2. **Update connection string** in production environment variables
3. **Configure IP whitelist** for your deployment platforms

Access the interactive API documentation at:
```
http://localhost:5000/api/docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

#### Projects
- `GET /api/projects` - List projects with filtering
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/projects` - Project analytics
- `GET /api/analytics/team` - Team performance

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Three-tier permission system
- **Input Validation**: Comprehensive validation with sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Helmet.js**: Security headers for Express.js
- **Password Hashing**: bcrypt for secure password storage

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage all projects and tasks
- User management capabilities
- Access to all analytics

### Manager
- Create and manage projects
- Assign team members to projects
- View team analytics
- Manage tasks within their projects

### Team Member
- View assigned projects and tasks
- Update task status and add comments
- View personal dashboard
- Limited analytics access

## 🚀 Production Deployment

### Backend Deployment (Railway)

1. **Prepare for deployment**
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy to Railway**
   - Connect your GitHub repository to Railway
   - Set environment variables in Railway dashboard
   - Deploy automatically on push to main branch

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd frontend
   npx vercel --prod
   ```

2. **Environment Variables**
   - Set NEXT_PUBLIC_API_URL to your production backend URL

### Database (MongoDB Atlas)

1. **Create MongoDB Atlas cluster**
2. **Update connection string** in production environment variables
3. **Configure IP whitelist** for your deployment platforms

<!-- Testing section removed: project currently has no automated test suite configured. -->

## 📊 Performance & Monitoring

- **Request Logging**: Winston for comprehensive logging
- **Error Tracking**: Global error handlers
- **Performance Metrics**: Built-in analytics dashboard
- **Database Indexing**: Optimized MongoDB queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the API documentation for detailed endpoints

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced reporting with PDF export
- [ ] Time tracking functionality
- [ ] Gantt chart visualization
- [ ] Mobile app development
- [ ] Integration with third-party tools (Slack, Email)
- [ ] Advanced workflow automation

---

**Built with ❤️ for enterprise task management**