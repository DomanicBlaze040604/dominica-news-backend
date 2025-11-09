# Article Features Implementation Guide

## ✅ Backend Changes Complete

I've implemented all the missing features in the backend. Here's what was added:

### 1. **Universal Embeds Support** 
- Added `embeds` field to Article model supporting **ANY platform** (Instagram, Twitter, YouTube, Spotify, TikTok, Vimeo, and literally anything else!)
- Each embed has: `type`, `url` (optional), `embedCode` (optional), `caption` (optional), `width` (optional), `height` (optional)
- Completely flexible - can embed anything with a URL or custom HTML code

### 2. **Scheduled Publishing**
- Added `scheduled` status to articles (in addition to draft, published, archived)
- Added `scheduledFor` field to store the scheduled date/time
- Created automatic publisher service that runs every minute to publish scheduled articles
- Added manual trigger endpoint for admins: `POST /api/admin/publish-scheduled`

### 3. **Article Editing by ID**
- Added new endpoint: `GET /api/articles/id/:id` (requires authentication)
- This allows fetching article by ID for editing (not just by slug)

### 4. **Excerpt Field**
- Already exists in the model and is fully supported

### 5. **Category Association**
- Already working - articles are properly linked to categories
- Endpoint exists: `GET /api/articles/category/:categorySlug`

---

## 🎨 Frontend Implementation Guide

### API Endpoints You Need to Use

#### 1. **Create Article**
```javascript
POST /api/articles
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title: string,
  content: string,
  excerpt: string,
  featuredImage: string,
  featuredImageAlt: string,
  categoryId: string,
  authorId: string,
  tags: string[],
  status: 'draft' | 'published' | 'scheduled',
  scheduledAt: Date (ISO string),
  embeds: [{
    type: string, // Any platform name (e.g., 'instagram', 'youtube', 'spotify', 'custom')
    url: string (optional),
    embedCode: string (optional),
    caption: string (optional),
    width: string (optional),
    height: string (optional)
  }],
  gallery: string[],
  isBreaking: boolean,
  isFeatured: boolean,
  isPinned: boolean,
  location: string,
  language: 'en' | 'es',
  seoTitle: string,
  seoDescription: string
}
```

#### 2. **Get Article for Editing**
```javascript
GET /api/articles/id/:articleId
Headers: { Authorization: 'Bearer <token>' }
```

#### 3. **Update Article**
```javascript
PUT /api/articles/:articleId
Headers: { Authorization: 'Bearer <token>' }
Body: {
  // Same fields as create, all optional
  // Only send fields you want to update
}
```

#### 4. **Get Articles by Category**
```javascript
GET /api/articles/category/:categorySlug?page=1&limit=12&status=published
```

---

## 📝 Frontend Implementation Steps

### Step 1: Update Article Editor Form

Add these fields to your article editor:

```jsx
// 1. EXCERPT FIELD (should be visible)
<textarea
  name="excerpt"
  placeholder="Brief summary (max 300 characters)"
  maxLength={300}
  value={article.excerpt}
  onChange={handleChange}
/>

// 2. SCHEDULE OPTION
<div className="schedule-section">
  <label>
    <input
      type="radio"
      name="publishOption"
      value="now"
      checked={publishOption === 'now'}
      onChange={() => setPublishOption('now')}
    />
    Publish Now
  </label>
  
  <label>
    <input
      type="radio"
      name="publishOption"
      value="schedule"
      checked={publishOption === 'schedule'}
      onChange={() => setPublishOption('schedule')}
    />
    Schedule for Later
  </label>
  
  {publishOption === 'schedule' && (
    <input
      type="datetime-local"
      name="scheduledAt"
      value={scheduledAt}
      onChange={(e) => setScheduledAt(e.target.value)}
    />
  )}
</div>

// 3. EMBEDS SECTION
<div className="embeds-section">
  <h3>Social Media Embeds</h3>
  <button onClick={addEmbed}>+ Add Embed</button>
  
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
        placeholder="Embed URL"
        value={embed.url}
        onChange={(e) => updateEmbed(index, 'url', e.target.value)}
      />
      
      <textarea
        placeholder="Embed Code (optional)"
        value={embed.embedCode}
        onChange={(e) => updateEmbed(index, 'embedCode', e.target.value)}
      />
      
      <button onClick={() => removeEmbed(index)}>Remove</button>
    </div>
  ))}
</div>
```

### Step 2: Handle Form Submission

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
    isBreaking,
    isFeatured,
    isPinned,
    location,
    language,
    seoTitle,
    seoDescription
  };
  
  // Handle status and scheduling
  if (publishOption === 'schedule') {
    articleData.status = 'scheduled';
    articleData.scheduledAt = scheduledAt;
  } else {
    articleData.status = 'published';
  }
  
  try {
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    
    const result = await response.json();
    if (result.success) {
      // Success! Redirect or show message
      console.log('Article created:', result.data);
    }
  } catch (error) {
    console.error('Error creating article:', error);
  }
};
```

### Step 3: Load Article for Editing

```javascript
const loadArticleForEdit = async (articleId) => {
  try {
    const response = await fetch(`/api/articles/id/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (result.success) {
      const article = result.data;
      
      // Populate form fields
      setTitle(article.title);
      setContent(article.content);
      setExcerpt(article.excerpt);
      setFeaturedImage(article.featuredImage);
      setCategoryId(article.category.id);
      setEmbeds(article.embeds || []);
      setGallery(article.gallery || []);
      
      // Handle scheduling
      if (article.status === 'scheduled' && article.scheduledFor) {
        setPublishOption('schedule');
        setScheduledAt(new Date(article.scheduledFor).toISOString().slice(0, 16));
      }
      
      // ... set other fields
    }
  } catch (error) {
    console.error('Error loading article:', error);
  }
};
```

### Step 4: Update Article

```javascript
const handleUpdate = async (e) => {
  e.preventDefault();
  
  const updateData = {
    title,
    content,
    excerpt,
    featuredImage,
    categoryId,
    embeds,
    gallery,
    // ... other fields
  };
  
  // Handle scheduling
  if (publishOption === 'schedule') {
    updateData.status = 'scheduled';
    updateData.scheduledAt = scheduledAt;
  } else if (publishOption === 'now') {
    updateData.status = 'published';
    updateData.scheduledAt = null; // Clear any existing schedule
  }
  
  try {
    const response = await fetch(`/api/articles/${articleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Article updated:', result.data);
    }
  } catch (error) {
    console.error('Error updating article:', error);
  }
};
```

### Step 5: Display Embeds in Article View

```jsx
const ArticleView = ({ article }) => {
  return (
    <div className="article">
      <h1>{article.title}</h1>
      
      {/* Excerpt */}
      {article.excerpt && (
        <p className="excerpt">{article.excerpt}</p>
      )}
      
      {/* Featured Image */}
      {article.featuredImage && (
        <img src={article.featuredImage} alt={article.featuredImageAlt} />
      )}
      
      {/* Content */}
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {/* Embeds */}
      {article.embeds && article.embeds.length > 0 && (
        <div className="embeds-container">
          {article.embeds.map((embed, index) => (
            <div key={index} className="embed-wrapper">
              {embed.embedCode ? (
                <div dangerouslySetInnerHTML={{ __html: embed.embedCode }} />
              ) : (
                <EmbedPreview type={embed.type} url={embed.url} />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Gallery */}
      {article.gallery && article.gallery.length > 0 && (
        <div className="gallery">
          {article.gallery.map((image, index) => (
            <img key={index} src={image} alt={`Gallery ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Step 6: Instagram Embed Component (Like the Image)

```jsx
const InstagramEmbed = ({ url }) => {
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
  
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: '#FFF',
        border: 0,
        borderRadius: '3px',
        boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
        margin: '1px',
        maxWidth: '540px',
        minWidth: '326px',
        padding: 0,
        width: 'calc(100% - 2px)'
      }}
    />
  );
};
```

---

## 🔧 CSS Styling for Embeds

```css
/* Embed Container */
.embeds-container {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.embed-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Instagram Embed Styling */
.instagram-media {
  margin: 0 auto !important;
}

/* Responsive */
@media (max-width: 768px) {
  .embed-wrapper {
    width: 100%;
  }
  
  .instagram-media {
    min-width: 100% !important;
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Article not showing in category
**Solution**: Make sure you're passing the correct `categoryId` when creating/updating the article. The backend properly associates articles with categories.

### Issue: Can't edit published article
**Solution**: Use the new endpoint `GET /api/articles/id/:articleId` instead of the slug endpoint. The slug endpoint increments view count and is for public viewing.

### Issue: Excerpt not visible
**Solution**: Make sure your frontend form includes the excerpt field and you're sending it in the request body.

### Issue: Scheduled articles not publishing
**Solution**: The backend automatically publishes scheduled articles every minute. You can also manually trigger it via `POST /api/admin/publish-scheduled` (admin only).

### Issue: Embeds not rendering
**Solution**: 
1. Make sure you're including the embed script (e.g., Instagram's embed.js)
2. Use `dangerouslySetInnerHTML` for embedCode
3. Call the embed platform's process function after mounting

---

## 📊 Article Status Flow

```
Draft → Published (immediate)
Draft → Scheduled → Published (automatic at scheduled time)
Published → Archived
Scheduled → Draft (if you change your mind)
```

---

## 🚀 Deployment

After implementing these changes in your frontend:

1. Test locally first
2. Deploy backend changes (already done)
3. Deploy frontend with new features
4. Verify all features work in production

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Verify authentication token is being sent
4. Ensure categoryId and authorId are valid MongoDB ObjectIds
