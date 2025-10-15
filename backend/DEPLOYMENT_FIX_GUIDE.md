# Backend Deployment Fix - CORS and Serverless Issues

## Issues Resolved

### 1. CORS Error
- **Problem**: CORS was set to `true` instead of `'*'` causing origin validation issues
- **Solution**: Updated CORS configuration in multiple places to explicitly allow all origins

### 2. FUNCTION_INVOCATION_FAILED Error
- **Problem**: Serverless function timeout or crash during initialization
- **Solution**: 
  - Fixed database connection handling for serverless environments
  - Added connection pooling and reuse
  - Improved error handling in registration endpoint

## Changes Made

### 1. `config/index.ts`
- Changed CORS origin from `true` to `'*'` to allow all origins

### 2. `src/app.ts`
- Updated CORS middleware to explicitly allow all origins
- Changed from `config.cors.origin` to hardcoded `'*'`

### 3. `api/index.js` (Critical Serverless Entry Point)
- Added database connection middleware for serverless
- Added explicit CORS headers in middleware
- Improved error handling and fallback
- Database connects on each request (reuses existing connection)

### 4. `src/models/database.ts`
- Enhanced connection pooling for serverless
- Added connection state checking to prevent duplicate connections
- Increased timeout settings for serverless cold starts
- Added IPv4 preference for faster connections

### 5. `vercel.json`
- Updated from simple rewrites to proper builds configuration
- Added explicit CORS headers at the platform level
- Added routes configuration with all HTTP methods
- Set NODE_ENV to production

### 6. `src/controllers/authController.ts`
- Enhanced error logging for registration endpoint
- Added detailed error messages for debugging

## Deployment Steps

### Step 1: Build and Test Locally
```bash
cd backend
npm install
npm run build
```

### Step 2: Verify Environment Variables
Make sure your `.env` file has:
```
MONGODB_URI=mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
```

### Step 3: Configure Vercel Environment Variables
Add these environment variables in Vercel Dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following:

```
MONGODB_URI=mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
JWT_REFRESH_SECRET=<generate-a-strong-refresh-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=<generate-a-strong-session-secret>
LOG_LEVEL=info
```

### Step 4: Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy
cd backend
vercel --prod
```

Or push to your GitHub repository and Vercel will auto-deploy.

## Testing the Deployment

### Test CORS
```bash
curl -X OPTIONS https://your-backend.vercel.app/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Test Registration
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Health Endpoint
```bash
curl https://your-backend.vercel.app/health
```

## Important Notes

### MongoDB Connection
- The database connection is now optimized for serverless
- Connections are reused across function invocations
- Connection pooling is configured for optimal performance

### CORS Configuration
- All origins are now allowed (`*`)
- If you want to restrict to specific origins later, update:
  - `config/index.ts` - cors.origin
  - `src/app.ts` - cors middleware
  - `api/index.js` - CORS headers
  - `vercel.json` - headers configuration

### Error Handling
- All errors now include detailed messages in development
- Production errors are sanitized to prevent information leakage
- Console logs added for debugging serverless functions

## Common Issues and Solutions

### Issue: Still getting CORS errors
**Solution**: 
1. Clear browser cache
2. Check that Vercel environment is properly set
3. Verify vercel.json is in the correct location
4. Redeploy: `vercel --prod --force`

### Issue: FUNCTION_INVOCATION_FAILED
**Solution**:
1. Check Vercel logs: `vercel logs <deployment-url>`
2. Verify MongoDB URI is correct in Vercel environment variables
3. Ensure MongoDB allows connections from all IPs (0.0.0.0/0) in Network Access
4. Check if MongoDB cluster is active

### Issue: Database connection timeout
**Solution**:
1. Verify MongoDB URI format
2. Check MongoDB cluster status
3. Ensure IP whitelist includes Vercel's IP ranges (use 0.0.0.0/0 for all)
4. Increase serverSelectionTimeoutMS in database.ts if needed

### Issue: Build fails on Vercel
**Solution**:
1. Check that all dependencies are in package.json
2. Verify tsconfig.json is correct
3. Ensure vercel-build script works: `npm run vercel-build`
4. Check Vercel build logs for specific errors

## Monitoring

### Vercel Dashboard
- Monitor function execution time
- Check error rates
- Review request logs

### MongoDB Atlas
- Monitor connection pool usage
- Check query performance
- Review slow queries

## Security Recommendations

### Before Production
1. **Generate Strong Secrets**: Use a tool like `openssl rand -base64 32` for secrets
2. **Restrict CORS**: Update to specific domains instead of `*`
3. **Enable Rate Limiting**: Uncomment rate limiting in app.ts if needed
4. **MongoDB IP Whitelist**: Consider restricting to Vercel IP ranges
5. **Environment Variables**: Never commit .env files to repository

## Rollback Plan
If issues persist:
1. Keep the old deployment URL
2. Update DNS to point back to old deployment
3. Investigate logs thoroughly
4. Test changes locally with `vercel dev`

## Support
If you encounter issues:
1. Check Vercel logs: `vercel logs --follow`
2. Check MongoDB Atlas logs
3. Review error messages in Postman/API client
4. Enable development mode temporarily for detailed errors
