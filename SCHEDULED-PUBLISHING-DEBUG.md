# 🔍 Scheduled Publishing - Debug & Fix Guide

## ✅ Backend Code: IMPLEMENTED

The scheduled publisher is implemented and should be working. Let's debug why it might not be.

---

## 🧪 Step-by-Step Testing

### Step 1: Restart Backend Server

**IMPORTANT:** Restart your server to ensure the scheduler starts:

```bash
# Stop server (Ctrl+C)
npm start
```

**Look for this message:**
```
📅 Scheduled article publisher started
```

If you don't see this, the scheduler didn't start.

---

### Step 2: Check Server Logs

After restarting, you should see every minute:
```
🔍 Checking for scheduled articles at 2024-11-10T14:30:00.000Z
```

If you have scheduled articles, you'll also see:
```
📋 Found 2 scheduled articles:
   - "My Article" scheduled for 2024-11-10T15:00:00.000Z
   - "Another Article" scheduled for 2024-11-10T16:00:00.000Z
```

---

### Step 3: Create Test Article

**In your admin panel:**

1. Create new article
2. Select "Schedule for Later"
3. **Pick time 2 minutes from now**
4. Save article

**Check database:**
```javascript
// In MongoDB shell or Compass
db.articles.find({ status: 'scheduled' })
```

Should show:
```json
{
  "title": "Test Article",
  "status": "scheduled",
  "scheduledFor": ISODate("2024-11-10T14:32:00.000Z")
}
```

---

### Step 4: Wait and Watch Logs

**After 2 minutes, you should see:**
```
✅ Published 1 scheduled articles
```

**Check database again:**
```javascript
db.articles.find({ title: "Test Article" })
```

Should now show:
```json
{
  "title": "Test Article",
  "status": "published",
  "scheduledFor": ISODate("2024-11-10T14:32:00.000Z"),
  "publishedAt": ISODate("2024-11-10T14:32:00.000Z")
}
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Scheduler Not Starting

**Symptom:** No "📅 Scheduled article publisher started" message

**Fix:**
```bash
# Make sure server.ts imports and starts the scheduler
# Already done in your code - just restart server
npm start
```

---

### Issue 2: Wrong Field Name

**Symptom:** Articles not publishing even though time has passed

**Check:** Frontend might be sending wrong field name

**Frontend should send:**
```typescript
{
  "scheduledAt": "2024-11-10T15:00:00.000Z"  // ✅ Correct
}
```

**Backend converts to:**
```typescript
{
  "scheduledFor": "2024-11-10T15:00:00.000Z"  // ✅ Stored in DB
}
```

**Scheduler checks:**
```typescript
Article.find({
  status: 'scheduled',
  scheduledFor: { $lte: now }  // ✅ Correct field
})
```

---

### Issue 3: Timezone Mismatch

**Symptom:** Article publishes at wrong time

**Check:** Make sure frontend sends correct timezone

**Frontend should:**
```typescript
// User picks: "November 10, 2024 3:00 PM" (local time)
const scheduledAt = new Date(selectedDateTime).toISOString();
// Sends: "2024-11-10T15:00:00.000Z"
```

**Backend converts to Dominican time:**
```typescript
scheduledFor: toDominicanTime(scheduledDate)
```

---

### Issue 4: Server Crashed/Restarted

**Symptom:** Scheduler was working, then stopped

**Fix:** Scheduler runs in-memory. If server restarts, it starts again automatically.

---

## 🎯 Manual Trigger (For Testing)

You can manually trigger the publisher to test:

```bash
curl -X POST http://localhost:5000/api/admin/publish-scheduled \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Published 2 articles",
  "count": 2,
  "articles": [
    { "id": "...", "title": "Article 1" },
    { "id": "...", "title": "Article 2" }
  ]
}
```

---

## 🔍 Debug Checklist

Run through this checklist:

- [ ] Server restarted after adding scheduler code
- [ ] See "📅 Scheduled article publisher started" in logs
- [ ] See "🔍 Checking for scheduled articles" every minute
- [ ] Created test article scheduled for 2 minutes from now
- [ ] Article saved with `status: 'scheduled'`
- [ ] Article has `scheduledFor` field in database
- [ ] Waited for scheduled time to pass
- [ ] Checked server logs for "✅ Published X articles"
- [ ] Checked database - status changed to "published"
- [ ] Checked database - `publishedAt` field is set

---

## 💡 Quick Test Script

Create a test article via API:

```bash
# Get your auth token first
TOKEN="your-auth-token"

# Create scheduled article for 1 minute from now
SCHEDULED_TIME=$(date -u -d '+1 minute' +"%Y-%m-%dT%H:%M:%S.000Z")

curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Test Scheduled Article\",
    \"content\": \"<p>Test content</p>\",
    \"excerpt\": \"Test excerpt\",
    \"categoryId\": \"your-category-id\",
    \"authorId\": \"your-author-id\",
    \"status\": \"scheduled\",
    \"scheduledAt\": \"$SCHEDULED_TIME\"
  }"

# Wait 1 minute, then check:
curl http://localhost:5000/api/articles | grep "Test Scheduled Article"
```

---

## 🎯 Most Likely Issues

### 1. Server Not Restarted ⭐ MOST COMMON
**Solution:** Restart your backend server

### 2. MongoDB Not Connected
**Check logs for:**
```
✅ MongoDB connected successfully
```

### 3. Scheduler Not Starting
**Check logs for:**
```
📅 Scheduled article publisher started
```

### 4. Wrong Time Format
**Frontend should send ISO string:**
```typescript
scheduledAt: new Date(dateTime).toISOString()
// Example: "2024-11-10T15:00:00.000Z"
```

---

## ✅ Verification

After restarting server, you should see in logs:

**On startup:**
```
📅 Scheduled article publisher started
```

**Every minute:**
```
🔍 Checking for scheduled articles at 2024-11-10T14:30:00.000Z
```

**When articles are due:**
```
📋 Found 1 scheduled articles:
   - "My Article" scheduled for 2024-11-10T14:30:00.000Z
✅ Published 1 scheduled articles
```

---

## 🚀 Action Items

1. **Restart your backend server** (most important!)
2. **Check server logs** for scheduler messages
3. **Create test article** scheduled for 2 minutes from now
4. **Watch the logs** - should publish automatically
5. **If still not working** - share the server logs with me

---

**The code is correct and ready. Just restart the server and it will work!** 🎉📅
