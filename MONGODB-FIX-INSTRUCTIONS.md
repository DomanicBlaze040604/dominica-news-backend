# MongoDB Duplicate Index Fix

## Problem
The backend logs show MongoDB warnings about duplicate schema indexes:
- `(node:12) [MONGOOSE] Warning: Duplicate schema index on {"email":1}`
- `(node:12) [MONGOOSE] Warning: Duplicate schema index on {"expiresAt":1}`
- `(node:12) [MONGOOSE] Warning: Duplicate schema index on {"slug":1}`

This is causing the backend to have issues and the frontend to crash.

## Solution

### Option 1: Run the Fix Script (Recommended)

1. **Connect to Railway and run the fix script:**
```bash
cd dominica-news-backend
node fix-mongodb-indexes.js
```

2. **Restart the Railway deployment:**
   - Go to Railway dashboard
   - Click on your web service
   - Click "Restart" button

### Option 2: Manual MongoDB Fix

1. **Connect to MongoDB directly:**
```bash
mongosh "your-mongodb-connection-string"
```

2. **Drop duplicate indexes:**
```javascript
// List all collections
show collections

// For each collection, drop indexes (except _id)
db.users.dropIndexes()
db.articles.dropIndexes()
db.categories.dropIndexes()
db.authors.dropIndexes()
db.staticpages.dropIndexes()
db.breakingnews.dropIndexes()
db.settings.dropIndexes()

// Exit
exit
```

3. **Restart backend** - Mongoose will recreate indexes properly

### Option 3: Add to package.json (Automatic Fix)

Add this to your `package.json` scripts:
```json
{
  "scripts": {
    "fix-indexes": "node fix-mongodb-indexes.js",
    "start": "node fix-mongodb-indexes.js && node dist/server.js",
    "start:prod": "node dist/server.js"
  }
}
```

Then redeploy to Railway.

## Verification

After fixing, check the logs. You should see:
- ✅ No more duplicate index warnings
- ✅ "MongoDB connected" message
- ✅ "Admin routes registered successfully"
- ✅ Server listening on port 8000

## Frontend Fix

The frontend is already configured to handle API errors gracefully. Once the backend is fixed, the frontend will work automatically.

## Quick Test

Test the backend is working:
```bash
curl https://web-production-af44.up.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "uptime": 123.456
}
```
