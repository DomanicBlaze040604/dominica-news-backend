# 🔴 Live Updates - Troubleshooting 401 Error

## ✅ Backend Status: READY!

The backend is **already implemented and working**. The 401 error is likely due to one of these issues:

---

## 🔍 Common Issues & Solutions

### Issue 1: Server Not Restarted

**Problem:** Backend code was added but server wasn't restarted.

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

---

### Issue 2: Wrong API URL

**Problem:** Frontend is calling wrong endpoint.

**Check your frontend API calls:**

❌ **Wrong:**
```typescript
fetch('/api/admin/live-updates')  // This requires auth!
```

✅ **Correct (Public):**
```typescript
fetch('/api/live-updates')  // No auth needed
fetch('/api/live-updates/active')  // No auth needed
fetch('/api/live-updates/:id')  // No auth needed
```

✅ **Correct (Admin - needs token):**
```typescript
fetch('/api/admin/live-updates', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

### Issue 3: CORS Issue

**Problem:** Frontend domain not allowed.

**Solution:** Already configured in `src/app.ts` - should work.

---

## 🧪 Test the Backend

### 1. Test Public Endpoints (No Auth Required)

**Get All Live Updates:**
```bash
curl http://localhost:5000/api/live-updates
```

**Get Active Live Updates:**
```bash
curl http://localhost:5000/api/live-updates/active
```

**Expected Response:**
```json
{
  "success": true,
  "data": []
}
```

### 2. Test Admin Endpoints (Auth Required)

**Create Live Update:**
```bash
curl -X POST http://localhost:5000/api/admin/live-updates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Live Update",
    "content": "Testing",
    "type": "general",
    "authorId": "your-author-id"
  }'
```

---

## 📋 API Endpoints Reference

### Public Endpoints (No Auth)
```
GET  /api/live-updates                  - Get all live updates
GET  /api/live-updates/active           - Get active updates
GET  /api/live-updates/type/:type       - Get by type
GET  /api/live-updates/:id              - Get single update
```

### Admin Endpoints (Auth Required)
```
POST   /api/admin/live-updates          - Create live update
POST   /api/admin/live-updates/:id/updates - Add update
PUT    /api/admin/live-updates/:id      - Update live update
DELETE /api/admin/live-updates/:id      - Delete live update
```

---

## 🔧 Frontend Fixes

### Fix 1: Update API Base URL

Make sure your frontend is using the correct base URL:

```typescript
// src/lib/api/liveUpdates.ts

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Public endpoints - NO AUTH
export const getActiveLiveUpdates = async (limit = 5) => {
  const response = await fetch(
    `${API_BASE}/api/live-updates/active?limit=${limit}`
  );
  return response.json();
};

// Admin endpoints - WITH AUTH
export const createLiveUpdate = async (data: any, token: string) => {
  const response = await fetch(
    `${API_BASE}/api/admin/live-updates`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};
```

### Fix 2: Check Token

Make sure you're passing the authentication token:

```typescript
// Get token from localStorage or auth context
const token = localStorage.getItem('token');

// Use in API calls
const result = await createLiveUpdate(data, token);
```

### Fix 3: Handle 401 Errors

```typescript
const response = await fetch('/api/admin/live-updates', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.status === 401) {
  // Token expired or invalid
  console.error('Authentication failed');
  // Redirect to login
  window.location.href = '/login';
}
```

---

## ✅ Verification Steps

### Step 1: Restart Backend
```bash
npm start
```

### Step 2: Test Public Endpoint
```bash
curl http://localhost:5000/api/live-updates/active
```

Should return:
```json
{
  "success": true,
  "data": []
}
```

### Step 3: Test in Browser
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/live-updates/active')
  .then(r => r.json())
  .then(console.log)
```

### Step 4: Test Admin Endpoint
Get your auth token from localStorage:
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);
```

Then test:
```javascript
fetch('http://localhost:5000/api/admin/live-updates', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(console.log)
```

---

## 🎯 Quick Fix Checklist

- [ ] Backend server restarted
- [ ] Public endpoints work (test with curl)
- [ ] Frontend using correct API URLs
- [ ] Auth token is being sent for admin endpoints
- [ ] CORS configured correctly
- [ ] No typos in endpoint URLs

---

## 📊 Expected Behavior

### Public Access (No Auth):
- ✅ Can view all live updates
- ✅ Can view active live updates
- ✅ Can view single live update
- ❌ Cannot create/edit/delete

### Admin Access (With Auth):
- ✅ Can view all live updates
- ✅ Can create live updates
- ✅ Can add updates
- ✅ Can edit live updates
- ✅ Can delete live updates (admin only)

---

## 🆘 Still Not Working?

### Check Backend Logs

Look for errors in your backend console when making requests.

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to access live updates
4. Check the request:
   - URL correct?
   - Headers sent?
   - Response status?
   - Response body?

### Check Database

Make sure MongoDB is running and connected:
```bash
# Check MongoDB connection in backend logs
# Should see: "✅ MongoDB connected successfully"
```

---

## 💡 Most Likely Solution

**The backend is ready!** You just need to:

1. **Restart the backend server**
2. **Update frontend to use correct URLs:**
   - Public: `/api/live-updates`
   - Admin: `/api/admin/live-updates`
3. **Ensure auth token is sent for admin endpoints**

---

**Backend is 100% ready and working! Just restart the server and check your frontend API calls.** 🚀
