# Frontend Implementation Checklist

## ✅ Backend is Ready!

All backend features have been implemented and tested. Here's what you need to do in your frontend:

---

## 🎯 Priority 1: Fix Article Editing

### Problem
After publishing an article, you cannot edit it.

### Solution
Change your "Edit Article" button to use the article ID instead of slug:

**Before:**
```javascript
// ❌ Don't use this for editing
fetch(`/api/articles/${slug}`)
```

**After:**
```javascript
// ✅ Use this for editing
fetch(`/api/articles/id/${articleId}`, {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Where to implement:**
- Article list/table in admin panel
- Edit button click handler
- Article editor page load

---

## 🎯 Priority 2: Add Excerpt Field

### Problem
Excerpt is not visible in the article editor.

### Solution
Add excerpt field to your article form:

```jsx
<div className="form-group">
  <label>Excerpt (Brief Summary)</label>
  <textarea
    name="excerpt"
    placeholder="Write a brief summary (max 300 characters)"
    maxLength={300}
    rows={3}
    value={article.excerpt || ''}
    onChange={handleChange}
    required
  />
  <small>{article.excerpt?.length || 0}/300 characters</small>
</div>
```

**Where to implement:**
- Article creation form
- Article edit form
- Display in article preview/view

---

## 🎯 Priority 3: Add Schedule Feature

### Problem
Schedule option is missing from the article editor.

### Solution
Add scheduling UI to your article form:

```jsx
<div className="publish-options">
  <h3>Publishing Options</h3>
  
  <label>
    <input
      type="radio"
      name="publishOption"
      value="draft"
      checked={status === 'draft'}
      onChange={() => setStatus('draft')}
    />
    Save as Draft
  </label>
  
  <label>
    <input
      type="radio"
      name="publishOption"
      value="publish"
      checked={status === 'published'}
      onChange={() => setStatus('published')}
    />
    Publish Now
  </label>
  
  <label>
    <input
      type="radio"
      name="publishOption"
      value="schedule"
      checked={status === 'scheduled'}
      onChange={() => setStatus('scheduled')}
    />
    Schedule for Later
  </label>
  
  {status === 'scheduled' && (
    <div className="schedule-datetime">
      <label>Schedule Date & Time</label>
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        min={new Date().toISOString().slice(0, 16)}
        required
      />
    </div>
  )}
</div>
```

**When submitting:**
```javascript
const articleData = {
  // ... other fields
  status: status, // 'draft', 'published', or 'scheduled'
  scheduledAt: status === 'scheduled' ? scheduledAt : null
};
```

---

## 🎯 Priority 4: Add Embed Functionality

### Problem
Embed functionality isn't working (Instagram, Twitter, YouTube, etc.)

### Solution

#### Step 1: Add Embed Manager to Article Form

```jsx
const [embeds, setEmbeds] = useState([]);

const addEmbed = () => {
  setEmbeds([...embeds, { type: 'instagram', url: '', embedCode: '' }]);
};

const updateEmbed = (index, field, value) => {
  const newEmbeds = [...embeds];
  newEmbeds[index][field] = value;
  setEmbeds(newEmbeds);
};

const removeEmbed = (index) => {
  setEmbeds(embeds.filter((_, i) => i !== index));
};

// In your form:
<div className="embeds-section">
  <h3>Social Media Embeds</h3>
  <button type="button" onClick={addEmbed}>+ Add Embed</button>
  
  {embeds.map((embed, index) => (
    <div key={index} className="embed-item">
      <select
        value={embed.type}
        onChange={(e) => updateEmbed(index, 'type', e.target.value)}
      >
        <option value="instagram">Instagram</option>
        <option value="twitter">Twitter</option>
        <option value="youtube">YouTube</option>
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
      </select>
      
      <input
        type="url"
        placeholder="Post URL"
        value={embed.url}
        onChange={(e) => updateEmbed(index, 'url', e.target.value)}
      />
      
      <textarea
        placeholder="Embed Code (optional - paste from platform)"
        value={embed.embedCode}
        onChange={(e) => updateEmbed(index, 'embedCode', e.target.value)}
        rows={4}
      />
      
      <button type="button" onClick={() => removeEmbed(index)}>
        Remove
      </button>
    </div>
  ))}
</div>
```

#### Step 2: Display Embeds in Article View

```jsx
// Create InstagramEmbed component
const InstagramEmbed = ({ url, embedCode }) => {
  useEffect(() => {
    // Load Instagram embed script
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [url]);
  
  if (embedCode) {
    return <div dangerouslySetInnerHTML={{ __html: embedCode }} />;
  }
  
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
    />
  );
};

// In your article view:
{article.embeds && article.embeds.length > 0 && (
  <div className="article-embeds">
    {article.embeds.map((embed, index) => (
      <div key={index} className="embed-container">
        {embed.type === 'instagram' && (
          <InstagramEmbed url={embed.url} embedCode={embed.embedCode} />
        )}
        {embed.type === 'youtube' && (
          <iframe
            width="560"
            height="315"
            src={embed.url.replace('watch?v=', 'embed/')}
            frameBorder="0"
            allowFullScreen
          />
        )}
        {/* Add other embed types as needed */}
      </div>
    ))}
  </div>
)}
```

#### Step 3: Add CSS for Embeds

```css
.embeds-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.embed-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  margin: 10px 0;
  background: #f9f9f9;
  border-radius: 4px;
}

.embed-item select,
.embed-item input,
.embed-item textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.article-embeds {
  margin: 30px 0;
}

.embed-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.instagram-media {
  margin: 0 auto !important;
  max-width: 540px;
}

@media (max-width: 768px) {
  .instagram-media {
    min-width: 100% !important;
  }
}
```

---

## 🎯 Priority 5: Fix Category Display

### Problem
Article is not showing in the relevant categories.

### Solution
The backend already handles this correctly. Make sure:

1. **When creating/editing article, send the correct categoryId:**
```javascript
const articleData = {
  // ... other fields
  categoryId: selectedCategory.id // Make sure this is the MongoDB ObjectId
};
```

2. **Fetch articles by category:**
```javascript
const fetchCategoryArticles = async (categorySlug) => {
  const response = await fetch(
    `/api/articles/category/${categorySlug}?status=published&page=1&limit=12`
  );
  const data = await response.json();
  
  if (data.success) {
    setArticles(data.data.articles);
    setCategory(data.data.category);
    setPagination(data.data.pagination);
  }
};
```

3. **Display category in article:**
```jsx
{article.category && (
  <span className="article-category" style={{ color: article.category.color }}>
    {article.category.name}
  </span>
)}
```

---

## 📋 Complete Form Submission Example

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const articleData = {
    title,
    content,
    excerpt,
    featuredImage,
    featuredImageAlt,
    categoryId,
    authorId,
    tags,
    embeds,
    gallery,
    status,
    scheduledAt: status === 'scheduled' ? scheduledAt : null,
    isBreaking,
    isFeatured,
    isPinned,
    location,
    language,
    seoTitle,
    seoDescription
  };
  
  try {
    const url = isEditing 
      ? `/api/articles/${articleId}` 
      : '/api/articles';
    
    const method = isEditing ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Article saved successfully!');
      // Redirect to article list or view
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error saving article:', error);
    alert('Failed to save article');
  }
};
```

---

## 🧪 Testing Checklist

After implementing the changes, test:

- [ ] Create a new article with excerpt
- [ ] Add Instagram embed to article
- [ ] Schedule article for future
- [ ] Publish article immediately
- [ ] Edit published article
- [ ] View article in its category
- [ ] Check excerpt displays correctly
- [ ] Verify embed renders properly
- [ ] Test scheduled article publishes automatically (wait for scheduled time)

---

## 📚 API Endpoints Reference

```
POST   /api/articles                    - Create article
GET    /api/articles/id/:id             - Get article by ID (for editing)
PUT    /api/articles/:id                - Update article
GET    /api/articles/:slug              - Get article by slug (public view)
GET    /api/articles/category/:slug     - Get articles by category
DELETE /api/articles/:id                - Delete article (admin only)
POST   /api/admin/publish-scheduled     - Manually trigger scheduled publishing
```

---

## 🎨 UI/UX Recommendations

1. **Excerpt Counter**: Show character count as user types
2. **Schedule Preview**: Show "Will be published on [date]" message
3. **Embed Preview**: Show preview of embed before saving
4. **Category Badge**: Display category with its color
5. **Status Indicator**: Show visual indicator for draft/published/scheduled
6. **Validation**: Validate required fields before submission
7. **Loading States**: Show loading spinner during save/update

---

## 🚀 Ready to Deploy

Once you've implemented these changes:

1. Test thoroughly in development
2. Deploy frontend changes
3. Verify all features work in production
4. Monitor for any errors

The backend is already deployed and ready! 🎉
