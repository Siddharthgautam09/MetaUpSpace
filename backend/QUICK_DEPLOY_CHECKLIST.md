# Quick Deployment Checklist

## Pre-Deployment
- [x] CORS configuration fixed (changed to `'*'`)
- [x] Serverless database connection implemented
- [x] Error handling enhanced
- [x] vercel.json properly configured
- [x] Build passes successfully

## Vercel Environment Variables Required

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask
NODE_ENV=production
JWT_SECRET=super-secret-key-change-in-production
JWT_REFRESH_SECRET=super-refresh-secret-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=session-secret-change-in-production
LOG_LEVEL=info
```

## MongoDB Atlas Checklist

1. **Network Access**: 
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (Allow access from anywhere)
   - This is required for Vercel serverless functions

2. **Database User**:
   - Username: `siddharth123`
   - Password: `test123`
   - Ensure user has read/write permissions

3. **Connection String**:
   - Verify the connection string is correct
   - Format: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?params`

## Deploy Command

```bash
cd backend
vercel --prod
```

## Test After Deployment

### 1. Health Check
```bash
curl https://your-backend-url.vercel.app/health
```
Expected: `{"success":true,"message":"API is healthy",...}`

### 2. CORS Preflight
```bash
curl -X OPTIONS https://your-backend-url.vercel.app/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -v
```
Expected: Status 200 with CORS headers

### 3. Registration
```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Troubleshooting

### If CORS Error Persists
1. Clear browser cache
2. Check browser console for exact error
3. Verify vercel.json is deployed: `vercel inspect <url>`
4. Force redeploy: `vercel --prod --force`

### If FUNCTION_INVOCATION_FAILED
1. Check logs: `vercel logs --follow`
2. Verify MongoDB connection string
3. Check MongoDB IP whitelist (must include 0.0.0.0/0)
4. Test database connection from Vercel logs

### View Logs
```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs <deployment-url>
```

## Files Changed

1. ✅ `config/index.ts` - CORS origin to `'*'`
2. ✅ `src/app.ts` - Direct CORS config
3. ✅ `api/index.js` - Serverless entry with DB connection
4. ✅ `src/models/database.ts` - Enhanced serverless connection
5. ✅ `vercel.json` - Proper builds and CORS headers
6. ✅ `src/controllers/authController.ts` - Better error handling

## Key Changes Summary

### CORS
- Changed from config-based to hardcoded `'*'` for all origins
- Added CORS headers at multiple levels (app, api, vercel.json)
- Handles OPTIONS preflight requests properly

### Database
- Connection reuse for serverless
- Connection pooling optimized
- Timeout increased for cold starts
- State checking to prevent duplicate connections

### Error Handling
- Detailed errors in development
- Sanitized errors in production
- Console logging for Vercel logs
- Better error messages for debugging
