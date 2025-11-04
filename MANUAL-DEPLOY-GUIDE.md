# 🚂 Manual Railway Deployment Guide

## Option 1: Railway CLI (Recommended)

### Step 1: Login to Railway
```bash
railway login
```
This will open your browser for authentication.

### Step 2: Deploy
```bash
railway up
```

### Step 3: Get your production URL
```bash
railway domain
```

## Option 2: Railway Dashboard (Alternative)

### Step 1: Go to Railway Dashboard
1. Visit https://railway.app
2. Login to your account
3. Find your Dominica News project

### Step 2: Trigger Deployment
1. Go to your project dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Click "Deploy" or wait for auto-deployment from Git

### Step 3: Get your production URL
1. In your service dashboard
2. Look for "Domains" section
3. Copy your production URL (e.g., `https://web-production-af44.up.railway.app`)

## Step 4: Test Production API

### Update the test script with your actual URL:
1. Open `test-production-api.js`
2. Update line 4: `const PRODUCTION_URL = 'YOUR_ACTUAL_RAILWAY_URL/api';`
3. Run: `node test-production-api.js`

## Step 5: Update Frontend

### Update your frontend environment:
```bash
# In your frontend .env file
VITE_API_BASE_URL=https://your-actual-railway-url.up.railway.app/api
```

## Environment Variables (Already Set)

Your Railway project should have these environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to "production"
- `FRONTEND_URL` - Your frontend URL for CORS
- `ADMIN_EMAIL` - admin@dominicanews.com
- `ADMIN_PASSWORD` - Pass@12345

## Troubleshooting

### If deployment fails:
1. Check Railway logs in the dashboard
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Check for any build errors

### If API tests fail:
1. Wait 2-3 minutes for deployment to complete
2. Check Railway service status
3. Verify the production URL is correct
4. Check Railway logs for runtime errors

## 🎯 Success Indicators

When everything is working:
- ✅ `node test-production-api.js` passes all tests
- ✅ Frontend can load articles from production API
- ✅ Admin panel works with production backend
- ✅ Content creation works with auto-slugs