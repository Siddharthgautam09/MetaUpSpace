# Postman Testing Guide for Backend API

## Setup Postman Collection

### 1. Create Environment Variables in Postman

Create a new environment called "Backend Production" with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| baseUrl | https://your-backend.vercel.app | https://your-backend.vercel.app |
| accessToken | (leave empty) | (will be set automatically) |
| refreshToken | (leave empty) | (will be set automatically) |

### 2. Test Collection

## Test 1: Health Check

**Name**: Health Check  
**Method**: GET  
**URL**: `{{baseUrl}}/health`  
**Headers**: None required

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2025-10-15T...",
  "environment": "production",
  "database": "connected"
}
```

---

## Test 2: API Info

**Name**: API Info  
**Method**: GET  
**URL**: `{{baseUrl}}/api`  
**Headers**: None required

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Enterprise Task Management API",
  "version": "v1",
  "endpoints": {
    "auth": "/api/auth",
    "projects": "/api/projects",
    "tasks": "/api/tasks",
    "analytics": "/api/analytics",
    "docs": "/api/docs"
  }
}
```

---

## Test 3: Register User

**Name**: Register User  
**Method**: POST  
**URL**: `{{baseUrl}}/api/auth/register`  
**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering",
  "phoneNumber": "+1234567890",
  "role": "team_member"
}
```

**Tests** (Add this to Tests tab in Postman):
```javascript
// Parse response
const response = pm.response.json();

// Test status code
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Test response structure
pm.test("Response has success=true", function () {
    pm.expect(response.success).to.be.true;
});

pm.test("Response contains user data", function () {
    pm.expect(response.data).to.have.property('user');
    pm.expect(response.data).to.have.property('accessToken');
    pm.expect(response.data).to.have.property('refreshToken');
});

// Save tokens for future requests
if (response.data && response.data.accessToken) {
    pm.environment.set("accessToken", response.data.accessToken);
    pm.environment.set("refreshToken", response.data.refreshToken);
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "team_member",
      "department": "Engineering",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Test 4: Login User

**Name**: Login User  
**Method**: POST  
**URL**: `{{baseUrl}}/api/auth/login`  
**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Login successful", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.message).to.eql("Login successful");
});

// Save tokens
if (response.data && response.data.accessToken) {
    pm.environment.set("accessToken", response.data.accessToken);
    pm.environment.set("refreshToken", response.data.refreshToken);
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## Test 5: Get User Profile

**Name**: Get Profile  
**Method**: GET  
**URL**: `{{baseUrl}}/api/auth/profile`  
**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Profile retrieved", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('user');
});
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": { ... }
  }
}
```

---

## Test 6: Create Project

**Name**: Create Project  
**Method**: POST  
**URL**: `{{baseUrl}}/api/projects`  
**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body** (raw JSON):
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "startDate": "2025-10-15",
  "endDate": "2025-12-31",
  "status": "planning"
}
```

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Project created", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('project');
});

// Save project ID for future requests
if (response.data && response.data.project) {
    pm.environment.set("projectId", response.data.project._id);
}
```

---

## Test 7: Get All Projects

**Name**: Get All Projects  
**Method**: GET  
**URL**: `{{baseUrl}}/api/projects`  
**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Projects retrieved", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('projects');
    pm.expect(response.data.projects).to.be.an('array');
});
```

---

## Test 8: Create Task

**Name**: Create Task  
**Method**: POST  
**URL**: `{{baseUrl}}/api/tasks`  
**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body** (raw JSON):
```json
{
  "title": "Design Homepage",
  "description": "Create mockups for the new homepage design",
  "projectId": "{{projectId}}",
  "priority": "high",
  "status": "todo",
  "dueDate": "2025-10-25"
}
```

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Task created", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('task');
});

// Save task ID
if (response.data && response.data.task) {
    pm.environment.set("taskId", response.data.task._id);
}
```

---

## Test 9: Get All Tasks

**Name**: Get All Tasks  
**Method**: GET  
**URL**: `{{baseUrl}}/api/tasks`  
**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters** (optional):
- `status`: todo, in_progress, completed
- `priority`: low, medium, high, urgent
- `projectId`: specific project ID

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Tasks retrieved", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('tasks');
    pm.expect(response.data.tasks).to.be.an('array');
});
```

---

## Test 10: Update Task Status

**Name**: Update Task  
**Method**: PUT  
**URL**: `{{baseUrl}}/api/tasks/{{taskId}}`  
**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body** (raw JSON):
```json
{
  "status": "in_progress"
}
```

**Tests**:
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Task updated", function () {
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.task.status).to.eql("in_progress");
});
```

---

## Common Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Email is required", "Password must be at least 8 characters"]
}
```

### 401 Unauthorized - Authentication Required
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found - Resource Not Found
```json
{
  "success": false,
  "message": "Task not found"
}
```

### 409 Conflict - Duplicate Entry
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## CORS Testing in Postman

Postman automatically handles CORS, but to test CORS specifically:

1. Use **Postman Interceptor** or **Browser Console**
2. Or use `curl` commands from terminal

### Test CORS with curl:
```bash
# Test OPTIONS preflight
curl -X OPTIONS https://your-backend.vercel.app/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Check for these headers in response:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Import Collection JSON

You can import this collection into Postman. Here's a sample JSON (save as `backend-api-tests.postman_collection.json`):

```json
{
  "info": {
    "name": "Enterprise Task Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"SecurePass123!\",\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"department\": \"Engineering\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "register"]
        }
      }
    }
  ]
}
```

---

## Tips for Testing

1. **Always start with Health Check** to ensure API is up
2. **Register a new user** before testing other endpoints
3. **Save tokens** to environment variables automatically using Tests scripts
4. **Use unique emails** for each registration test (e.g., test1@example.com, test2@example.com)
5. **Check response times** - should be under 2-3 seconds for serverless
6. **Test error cases** - try invalid data to verify validation
7. **Monitor Vercel logs** while testing: `vercel logs --follow`

---

## Quick Test Sequence

1. ✅ Health Check → Verify API is running
2. ✅ Register User → Get access token
3. ✅ Get Profile → Verify authentication works
4. ✅ Create Project → Test project creation
5. ✅ Get Projects → Verify project retrieval
6. ✅ Create Task → Test task creation
7. ✅ Get Tasks → Verify task retrieval
8. ✅ Update Task → Test task updates

This sequence tests the complete flow of the application!
