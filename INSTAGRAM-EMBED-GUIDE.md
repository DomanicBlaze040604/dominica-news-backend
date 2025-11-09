# Instagram Embed Implementation Guide

## 📸 How to Get Instagram Embed Code

### Method 1: From Instagram Website (Recommended)

1. Go to the Instagram post in your browser
2. Click the three dots (...) in the top right of the post
3. Click "Embed"
4. Copy the embed code provided
5. Paste it into your article's embed field

### Method 2: Just Use the URL

You can also just paste the Instagram post URL, and the frontend will handle the embedding automatically.

---

## 🎨 Frontend Implementation

### Step 1: Create Instagram Embed Component

```jsx
import React, { useEffect } from 'react';

const InstagramEmbed = ({ url, embedCode }) => {
  useEffect(() => {
    // Load Instagram embed script if not already loaded
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    }
  }, [url, embedCode]);

  // If embedCode is provided, use it directly
  if (embedCode) {
    return (
      <div 
        className="instagram-embed-wrapper"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  // Otherwise, create embed from URL
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: '#FFF',
        border: 0,
        borderRadius: '3px',
        boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
        margin: '1px',
        maxWidth: '540px',
        minWidth: '326px',
        padding: 0,
        width: 'calc(100% - 2px)'
      }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        View this post on Instagram
      </a>
    </blockquote>
  );
};

export default InstagramEmbed;
```

### Step 2: Use in Article View

```jsx
import InstagramEmbed from './InstagramEmbed';

const ArticleView = ({ article }) => {
  return (
    <article className="article-content">
      <h1>{article.title}</h1>
      
      {article.excerpt && (
        <p className="article-excerpt">{article.excerpt}</p>
      )}
      
      {article.featuredImage && (
        <img 
          src={article.featuredImage} 
          alt={article.featuredImageAlt || article.title}
          className="featured-image"
        />
      )}
      
      <div 
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      {/* Embeds Section */}
      {article.embeds && article.embeds.length > 0 && (
        <div className="article-embeds">
          {article.embeds.map((embed, index) => (
            <div key={index} className="embed-container">
              {embed.type === 'instagram' && (
                <InstagramEmbed 
                  url={embed.url} 
                  embedCode={embed.embedCode}
                />
              )}
              
              {embed.type === 'twitter' && (
                <TwitterEmbed url={embed.url} />
              )}
              
              {embed.type === 'youtube' && (
                <YouTubeEmbed url={embed.url} />
              )}
              
              {embed.type === 'facebook' && (
                <FacebookEmbed url={embed.url} />
              )}
              
              {embed.type === 'tiktok' && (
                <TikTokEmbed url={embed.url} />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Gallery */}
      {article.gallery && article.gallery.length > 0 && (
        <div className="article-gallery">
          {article.gallery.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Gallery image ${index + 1}`}
              className="gallery-image"
            />
          ))}
        </div>
      )}
    </article>
  );
};

export default ArticleView;
```

### Step 3: Add CSS Styling

```css
/* Article Embeds Container */
.article-embeds {
  margin: 40px 0;
  padding: 20px 0;
}

.embed-container {
  margin: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Instagram Embed Styling */
.instagram-embed-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
}

.instagram-media {
  margin: 0 auto !important;
  max-width: 540px !important;
  width: 100% !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .instagram-media {
    min-width: 100% !important;
    max-width: 100% !important;
  }
  
  .embed-container {
    padding: 0 10px;
  }
}

/* Loading State */
.instagram-media::before {
  content: 'Loading Instagram post...';
  display: block;
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

/* Gallery Styling */
.article-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin: 30px 0;
}

.gallery-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-image:hover {
  transform: scale(1.05);
}
```

---

## 🎯 Article Editor - Embed Manager

### Add Embed Form Component

```jsx
import React, { useState } from 'react';

const EmbedManager = ({ embeds, onChange }) => {
  const [localEmbeds, setLocalEmbeds] = useState(embeds || []);

  const addEmbed = () => {
    const newEmbeds = [...localEmbeds, { type: 'instagram', url: '', embedCode: '' }];
    setLocalEmbeds(newEmbeds);
    onChange(newEmbeds);
  };

  const updateEmbed = (index, field, value) => {
    const newEmbeds = [...localEmbeds];
    newEmbeds[index][field] = value;
    setLocalEmbeds(newEmbeds);
    onChange(newEmbeds);
  };

  const removeEmbed = (index) => {
    const newEmbeds = localEmbeds.filter((_, i) => i !== index);
    setLocalEmbeds(newEmbeds);
    onChange(newEmbeds);
  };

  const getEmbedInstructions = (type) => {
    const instructions = {
      instagram: 'Paste Instagram post URL or embed code',
      twitter: 'Paste Twitter/X post URL',
      youtube: 'Paste YouTube video URL',
      facebook: 'Paste Facebook post URL',
      tiktok: 'Paste TikTok video URL'
    };
    return instructions[type] || 'Paste embed URL';
  };

  return (
    <div className="embed-manager">
      <div className="embed-manager-header">
        <h3>Social Media Embeds</h3>
        <button 
          type="button" 
          onClick={addEmbed}
          className="btn-add-embed"
        >
          + Add Embed
        </button>
      </div>

      {localEmbeds.length === 0 && (
        <p className="no-embeds-message">
          No embeds added yet. Click "Add Embed" to include social media posts.
        </p>
      )}

      {localEmbeds.map((embed, index) => (
        <div key={index} className="embed-item">
          <div className="embed-item-header">
            <span className="embed-number">Embed #{index + 1}</span>
            <button
              type="button"
              onClick={() => removeEmbed(index)}
              className="btn-remove-embed"
            >
              Remove
            </button>
          </div>

          <div className="embed-item-body">
            <div className="form-group">
              <label>Platform</label>
              <select
                value={embed.type}
                onChange={(e) => updateEmbed(index, 'type', e.target.value)}
                className="form-control"
              >
                <option value="instagram">📸 Instagram</option>
                <option value="twitter">🐦 Twitter/X</option>
                <option value="youtube">▶️ YouTube</option>
                <option value="facebook">👍 Facebook</option>
                <option value="tiktok">🎵 TikTok</option>
              </select>
            </div>

            <div className="form-group">
              <label>Post URL</label>
              <input
                type="url"
                placeholder={getEmbedInstructions(embed.type)}
                value={embed.url}
                onChange={(e) => updateEmbed(index, 'url', e.target.value)}
                className="form-control"
                required
              />
              <small className="form-hint">
                Example: https://www.instagram.com/p/ABC123/
              </small>
            </div>

            <div className="form-group">
              <label>Embed Code (Optional)</label>
              <textarea
                placeholder="Paste the full embed code from the platform (optional)"
                value={embed.embedCode || ''}
                onChange={(e) => updateEmbed(index, 'embedCode', e.target.value)}
                className="form-control"
                rows={4}
              />
              <small className="form-hint">
                For Instagram: Click ⋯ on post → Embed → Copy code
              </small>
            </div>

            {/* Preview */}
            {embed.url && (
              <div className="embed-preview">
                <p className="preview-label">Preview:</p>
                <a 
                  href={embed.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-link"
                >
                  {embed.url}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmbedManager;
```

### CSS for Embed Manager

```css
/* Embed Manager */
.embed-manager {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.embed-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.embed-manager-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-add-embed {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-add-embed:hover {
  background: #0056b3;
}

.no-embeds-message {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
  font-style: italic;
}

/* Embed Item */
.embed-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
}

.embed-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.embed-number {
  font-weight: 600;
  color: #495057;
}

.btn-remove-embed {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.3s;
}

.btn-remove-embed:hover {
  background: #c82333;
}

.embed-item-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #495057;
  font-size: 14px;
}

.form-control {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

/* Embed Preview */
.embed-preview {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-link {
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
  font-size: 13px;
}

.preview-link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .embed-manager {
    padding: 15px;
  }
  
  .embed-manager-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .btn-add-embed {
    width: 100%;
  }
}
```

---

## 🔧 Usage in Article Editor

```jsx
import React, { useState } from 'react';
import EmbedManager from './EmbedManager';

const ArticleEditor = () => {
  const [article, setArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    embeds: [],
    // ... other fields
  });

  const handleEmbedsChange = (newEmbeds) => {
    setArticle({ ...article, embeds: newEmbeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Submit article with embeds
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });
    
    // Handle response...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title, content, etc. */}
      
      <EmbedManager 
        embeds={article.embeds}
        onChange={handleEmbedsChange}
      />
      
      <button type="submit">Save Article</button>
    </form>
  );
};

export default ArticleEditor;
```

---

## 📱 Mobile Responsive Example

The Instagram embed will automatically adjust to mobile screens. Here's how it looks:

**Desktop (540px max-width):**
```
┌─────────────────────────────────┐
│                                 │
│     Instagram Post Content      │
│                                 │
│         [Image/Video]           │
│                                 │
│     Caption and comments...     │
│                                 │
└─────────────────────────────────┘
```

**Mobile (100% width):**
```
┌───────────────────┐
│                   │
│  Instagram Post   │
│                   │
│   [Image/Video]   │
│                   │
│  Caption...       │
│                   │
└───────────────────┘
```

---

## ✅ Testing Checklist

- [ ] Instagram embed loads correctly
- [ ] Embed is centered on page
- [ ] Responsive on mobile devices
- [ ] Multiple embeds work in same article
- [ ] Embed code option works
- [ ] URL-only option works
- [ ] Loading state shows before embed loads
- [ ] Embed manager UI is user-friendly
- [ ] Can add/remove embeds easily
- [ ] Preview link works

---

## 🐛 Troubleshooting

### Embed not showing
1. Check if Instagram script is loaded: `console.log(window.instgrm)`
2. Verify URL format is correct
3. Check browser console for errors
4. Try using embed code instead of URL

### Embed shows but doesn't load content
1. Check internet connection
2. Verify Instagram post is public
3. Try refreshing the page
4. Check if Instagram's embed.js is blocked by ad blocker

### Multiple embeds not working
1. Make sure to call `window.instgrm.Embeds.process()` after each embed is added
2. Use unique keys for each embed in the map function

---

## 🎉 Result

Your articles will now display beautiful Instagram embeds just like the image you shared, with proper styling and responsive design!
