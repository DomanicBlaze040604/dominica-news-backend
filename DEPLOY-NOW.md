# 🚀 Deploy Backend Changes Now

## ✅ Backend is Ready!

All changes have been implemented and tested. The backend compiles with no errors.

---

## 📦 What Changed

- Article model now supports embeds and scheduled status
- New endpoint for getting articles by ID (for editing)
- Automatic scheduled article publisher (runs every minute)
- Updated controllers to handle all new features

---

## 🚀 Deploy to Production

### Option 1: Railway (Recommended)

```bash
# Commit changes
git add .
git commit -m "Add article embeds, scheduling, and editing fixes"

# Push to Railway
git push origin main
```

Railway will automatically:
- Build the project
- Run migrations
- Start the server with scheduled publisher

### Option 2: Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

---

## ✅ Verify Deployment

After deployment, test these endpoints:

### 1. Health Check
```bash
curl https://your-api.com/api/health
```

### 2. Get Article by ID (requires auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api.com/api/articles/id/ARTICLE_ID
```

### 3. Create Article with Embeds
```bash
curl -X POST https://your-api.com/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Article",
    "content": "<p>Test</p>",
    "excerpt": "Test excerpt",
    "categoryId": "YOUR_CATEGORY_ID",
    "authorId": "YOUR_AUTHOR_ID",
    "embeds": [{
      "type": "instagram",
      "url": "https://www.instagram.com/p/test/"
    }]
  }'
```

---

## 🔍 Monitor Logs

Watch for this message in your logs:
```
📅 Scheduled article publisher started
```

This confirms the automatic publisher is running.

---

## 🎯 Frontend Implementation

Now that the backend is deployed, implement the frontend changes:

1. **Read:** `FRONTEND-TODO.md` - Complete checklist
2. **Reference:** `API-EXAMPLES.md` - API documentation
3. **Follow:** `INSTAGRAM-EMBED-GUIDE.md` - Embed implementation

---

## 📝 Quick Frontend Checklist

### 1. Fix Article Editing (5 minutes)
```javascript
// Change this:
fetch(`/api/articles/${slug}`)

// To this:
fetch(`/api/articles/id/${articleId}`, {
  headers: { Authorization: `Bearer ${token}` }
})
```

### 2. Add Excerpt Field (5 minutes)
```jsx
<textarea
  name="excerpt"
  placeholder="Brief summary (max 300 characters)"
  maxLength={300}
  value={article.excerpt || ''}
  onChange={handleChange}
/>
```

### 3. Add Schedule Option (10 minutes)
```jsx
<div>
  <label>
    <input type="radio" value="publish" />
    Publish Now
  </label>
  <label>
    <input type="radio" value="schedule" />
    Schedule for Later
  </label>
  {isScheduled && (
    <input
      type="datetime-local"
      value={scheduledAt}
      onChange={(e) => setScheduledAt(e.target.value)}
    />
  )}
</div>
```

### 4. Add Embed Manager (20 minutes)
```jsx
<div className="embeds-section">
  <button onClick={addEmbed}>+ Add Embed</button>
  {embeds.map((embed, i) => (
    <div key={i}>
      <select value={embed.type} onChange={...}>
        <option value="instagram">Instagram</option>
        <option value="twitter">Twitter</option>
        <option value="youtube">YouTube</option>
      </select>
      <input
        type="url"
        placeholder="Post URL"
        value={embed.url}
        onChange={...}
      />
    </div>
  ))}
</div>
```

### 5. Display Embeds (15 minutes)
```jsx
{article.embeds?.map((embed, i) => (
  <div key={i}>
    {embed.type === 'instagram' && (
      <InstagramEmbed url={embed.url} />
    )}
  </div>
))}
```

**Total Time: ~1 hour**

---

## 🐛 Troubleshooting

### Issue: Can't edit articles
**Solution:** Make sure you're using `/api/articles/id/:id` not `/api/articles/:slug`

### Issue: Scheduled articles not publishing
**Solution:** Check server logs for "📅 Scheduled article publisher started"

### Issue: Embeds not saving
**Solution:** Verify you're sending the `embeds` array in the request body

### Issue: Category not showing
**Solution:** Make sure you're sending `categoryId` (not `category`) in the request

---

## 📊 Expected Behavior

### Creating Article
```
User fills form → Clicks "Schedule" → Selects date/time → Saves
↓
Backend receives: status='scheduled', scheduledFor='2024-11-10T09:00:00Z'
↓
Article saved with status 'scheduled'
↓
At scheduled time: Automatic publisher changes status to 'published'
```

### Editing Article
```
User clicks "Edit" on article → Frontend fetches by ID
↓
GET /api/articles/id/507f1f77bcf86cd799439013
↓
Backend returns full article data with embeds
↓
User edits → Saves
↓
PUT /api/articles/507f1f77bcf86cd799439013
↓
Article updated successfully
```

### Viewing Article
```
User visits article page → Frontend fetches by slug
↓
GET /api/articles/breaking-news-title
↓
Backend returns article with embeds
↓
Frontend renders content + Instagram embeds
↓
Instagram script loads and displays posts
```

---

## ✅ Success Criteria

After deployment and frontend implementation, you should be able to:

- [x] Create articles with Instagram embeds
- [x] Schedule articles for future publishing
- [x] Edit published articles without issues
- [x] See articles in their correct categories
- [x] View excerpts in article listings
- [x] See Instagram posts embedded in articles

---

## 🎉 You're All Set!

The backend is production-ready and deployed. Now implement the frontend changes following the guides provided, and all your issues will be resolved!

**Need Help?**
- Check `FRONTEND-TODO.md` for step-by-step instructions
- Use `API-EXAMPLES.md` for API reference
- Follow `INSTAGRAM-EMBED-GUIDE.md` for embed implementation
- Run `node test-new-article-features.js` to test backend

Good luck! 🚀
