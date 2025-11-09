# 🌐 Universal Embed System - Support ANY Platform

## ✅ Backend Updated!

The embed system now supports **ANY** platform, not just Instagram, Twitter, YouTube, etc. You can embed:
- Social media (Instagram, Twitter, Facebook, TikTok, LinkedIn, Pinterest, etc.)
- Video platforms (YouTube, Vimeo, Dailymotion, Twitch, etc.)
- Audio (Spotify, SoundCloud, Apple Music, etc.)
- Documents (Google Docs, Scribd, SlideShare, etc.)
- Maps (Google Maps, Mapbox, etc.)
- Forms (Google Forms, Typeform, etc.)
- Code (CodePen, JSFiddle, GitHub Gist, etc.)
- **Literally anything with an embed code!**

---

## 📊 Embed Structure

```typescript
{
  type: string,        // Platform name (e.g., "instagram", "youtube", "custom")
  url?: string,        // Optional: Source URL
  embedCode?: string,  // Optional: Full embed HTML code
  caption?: string,    // Optional: Caption/description
  width?: string,      // Optional: Custom width (e.g., "100%", "560px")
  height?: string      // Optional: Custom height (e.g., "315px", "auto")
}
```

**Note:** Either `url` OR `embedCode` should be provided (or both).

---

## 🎯 Frontend Implementation

### Universal Embed Component

```jsx
import React, { useEffect, useRef } from 'react';

const UniversalEmbed = ({ embed }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Load platform-specific scripts
    loadEmbedScript(embed.type);
  }, [embed.type]);

  // If embedCode is provided, use it directly
  if (embed.embedCode) {
    return (
      <div className="embed-wrapper" ref={containerRef}>
        {embed.caption && <p className="embed-caption">{embed.caption}</p>}
        <div
          className={`embed-container embed-${embed.type}`}
          style={{
            width: embed.width || '100%',
            height: embed.height || 'auto'
          }}
          dangerouslySetInnerHTML={{ __html: embed.embedCode }}
        />
      </div>
    );
  }

  // Otherwise, render based on type and URL
  return (
    <div className="embed-wrapper" ref={containerRef}>
      {embed.caption && <p className="embed-caption">{embed.caption}</p>}
      <div className={`embed-container embed-${embed.type}`}>
        {renderEmbedByType(embed)}
      </div>
    </div>
  );
};

// Helper function to render embed based on type
const renderEmbedByType = (embed) => {
  const { type, url, width, height } = embed;
  
  switch (type.toLowerCase()) {
    case 'youtube':
      return (
        <iframe
          width={width || "560"}
          height={height || "315"}
          src={getYouTubeEmbedUrl(url)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    
    case 'vimeo':
      return (
        <iframe
          src={getVimeoEmbedUrl(url)}
          width={width || "640"}
          height={height || "360"}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    
    case 'spotify':
      return (
        <iframe
          src={getSpotifyEmbedUrl(url)}
          width={width || "100%"}
          height={height || "380"}
          frameBorder="0"
          allowTransparency="true"
          allow="encrypted-media"
        />
      );
    
    case 'soundcloud':
      return (
        <iframe
          width={width || "100%"}
          height={height || "166"}
          scrolling="no"
          frameBorder="no"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`}
        />
      );
    
    case 'twitter':
    case 'x':
      return (
        <blockquote className="twitter-tweet">
          <a href={url}>View Tweet</a>
        </blockquote>
      );
    
    case 'instagram':
      return (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
        />
      );
    
    case 'tiktok':
      return (
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={getTikTokVideoId(url)}
        >
          <a href={url}>View TikTok</a>
        </blockquote>
      );
    
    case 'facebook':
      return (
        <div
          className="fb-post"
          data-href={url}
          data-width={width || "500"}
        />
      );
    
    case 'codepen':
      return (
        <iframe
          height={height || "300"}
          style={{ width: width || '100%' }}
          scrolling="no"
          src={getCodePenEmbedUrl(url)}
          frameBorder="no"
          allowTransparency="true"
          allowFullScreen
        />
      );
    
    case 'github-gist':
      return (
        <script src={`${url}.js`} />
      );
    
    case 'google-maps':
      return (
        <iframe
          width={width || "600"}
          height={height || "450"}
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={url}
        />
      );
    
    default:
      // For any unknown type, try to render as iframe if URL is provided
      if (url) {
        return (
          <iframe
            src={url}
            width={width || "100%"}
            height={height || "400"}
            frameBorder="0"
            allowFullScreen
          />
        );
      }
      return <p>Unsupported embed type: {type}</p>;
  }
};

// Helper functions to convert URLs to embed URLs
const getYouTubeEmbedUrl = (url) => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
  return `https://www.youtube.com/embed/${videoId}`;
};

const getVimeoEmbedUrl = (url) => {
  const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
  return `https://player.vimeo.com/video/${videoId}`;
};

const getSpotifyEmbedUrl = (url) => {
  return url.replace('spotify.com/', 'spotify.com/embed/');
};

const getCodePenEmbedUrl = (url) => {
  return url.replace('/pen/', '/embed/');
};

const getTikTokVideoId = (url) => {
  return url.match(/video\/(\d+)/)?.[1];
};

// Load platform-specific scripts
const loadEmbedScript = (type) => {
  const scripts = {
    instagram: '//www.instagram.com/embed.js',
    twitter: '//platform.twitter.com/widgets.js',
    x: '//platform.twitter.com/widgets.js',
    tiktok: '//www.tiktok.com/embed.js',
    facebook: '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v12.0'
  };

  const scriptUrl = scripts[type.toLowerCase()];
  if (!scriptUrl) return;

  // Check if script already loaded
  if (document.querySelector(`script[src="${scriptUrl}"]`)) {
    // Process embeds if platform has a process function
    processEmbed(type);
    return;
  }

  const script = document.createElement('script');
  script.src = scriptUrl;
  script.async = true;
  script.onload = () => processEmbed(type);
  document.body.appendChild(script);
};

const processEmbed = (type) => {
  switch (type.toLowerCase()) {
    case 'instagram':
      if (window.instgrm) window.instgrm.Embeds.process();
      break;
    case 'twitter':
    case 'x':
      if (window.twttr) window.twttr.widgets.load();
      break;
    case 'tiktok':
      if (window.tiktokEmbed) window.tiktokEmbed.lib.render();
      break;
    case 'facebook':
      if (window.FB) window.FB.XFBML.parse();
      break;
  }
};

export default UniversalEmbed;
```

---

## 🎨 Article Editor - Universal Embed Manager

```jsx
import React, { useState } from 'react';

const UniversalEmbedManager = ({ embeds, onChange }) => {
  const [localEmbeds, setLocalEmbeds] = useState(embeds || []);
  const [showAdvanced, setShowAdvanced] = useState({});

  const platformOptions = [
    { value: 'instagram', label: '📸 Instagram', placeholder: 'https://www.instagram.com/p/ABC123/' },
    { value: 'twitter', label: '🐦 Twitter/X', placeholder: 'https://twitter.com/user/status/123' },
    { value: 'youtube', label: '▶️ YouTube', placeholder: 'https://www.youtube.com/watch?v=ABC123' },
    { value: 'vimeo', label: '🎬 Vimeo', placeholder: 'https://vimeo.com/123456' },
    { value: 'tiktok', label: '🎵 TikTok', placeholder: 'https://www.tiktok.com/@user/video/123' },
    { value: 'facebook', label: '👍 Facebook', placeholder: 'https://www.facebook.com/post/123' },
    { value: 'spotify', label: '🎧 Spotify', placeholder: 'https://open.spotify.com/track/123' },
    { value: 'soundcloud', label: '🔊 SoundCloud', placeholder: 'https://soundcloud.com/artist/track' },
    { value: 'codepen', label: '💻 CodePen', placeholder: 'https://codepen.io/user/pen/ABC' },
    { value: 'github-gist', label: '📝 GitHub Gist', placeholder: 'https://gist.github.com/user/123' },
    { value: 'google-maps', label: '🗺️ Google Maps', placeholder: 'Google Maps embed URL' },
    { value: 'custom', label: '🔧 Custom Embed', placeholder: 'Any URL or paste embed code' }
  ];

  const addEmbed = () => {
    const newEmbeds = [...localEmbeds, { 
      type: 'instagram', 
      url: '', 
      embedCode: '',
      caption: '',
      width: '',
      height: ''
    }];
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

  const toggleAdvanced = (index) => {
    setShowAdvanced({ ...showAdvanced, [index]: !showAdvanced[index] });
  };

  return (
    <div className="universal-embed-manager">
      <div className="embed-manager-header">
        <h3>📎 Embeds (Social Media, Videos, Audio, etc.)</h3>
        <button type="button" onClick={addEmbed} className="btn-add-embed">
          + Add Embed
        </button>
      </div>

      {localEmbeds.length === 0 && (
        <div className="no-embeds-message">
          <p>No embeds added yet.</p>
          <p>You can embed Instagram, YouTube, Spotify, and much more!</p>
        </div>
      )}

      {localEmbeds.map((embed, index) => {
        const platform = platformOptions.find(p => p.value === embed.type);
        
        return (
          <div key={index} className="embed-item">
            <div className="embed-item-header">
              <span className="embed-number">Embed #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeEmbed(index)}
                className="btn-remove-embed"
              >
                🗑️ Remove
              </button>
            </div>

            <div className="embed-item-body">
              {/* Platform Selector */}
              <div className="form-group">
                <label>Platform / Type</label>
                <select
                  value={embed.type}
                  onChange={(e) => updateEmbed(index, 'type', e.target.value)}
                  className="form-control"
                >
                  {platformOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Input */}
              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  placeholder={platform?.placeholder || 'Enter URL'}
                  value={embed.url || ''}
                  onChange={(e) => updateEmbed(index, 'url', e.target.value)}
                  className="form-control"
                />
                <small className="form-hint">
                  Paste the URL from the platform
                </small>
              </div>

              {/* Embed Code (Alternative) */}
              <div className="form-group">
                <label>OR Paste Embed Code (Optional)</label>
                <textarea
                  placeholder="<iframe src='...'></iframe> or <blockquote>...</blockquote>"
                  value={embed.embedCode || ''}
                  onChange={(e) => updateEmbed(index, 'embedCode', e.target.value)}
                  className="form-control"
                  rows={4}
                />
                <small className="form-hint">
                  If the platform provides embed code, paste it here
                </small>
              </div>

              {/* Caption */}
              <div className="form-group">
                <label>Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="Add a caption or description"
                  value={embed.caption || ''}
                  onChange={(e) => updateEmbed(index, 'caption', e.target.value)}
                  className="form-control"
                />
              </div>

              {/* Advanced Options */}
              <button
                type="button"
                onClick={() => toggleAdvanced(index)}
                className="btn-toggle-advanced"
              >
                {showAdvanced[index] ? '▼' : '▶'} Advanced Options
              </button>

              {showAdvanced[index] && (
                <div className="advanced-options">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Width</label>
                      <input
                        type="text"
                        placeholder="e.g., 100%, 560px"
                        value={embed.width || ''}
                        onChange={(e) => updateEmbed(index, 'width', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Height</label>
                      <input
                        type="text"
                        placeholder="e.g., 315px, auto"
                        value={embed.height || ''}
                        onChange={(e) => updateEmbed(index, 'height', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Link */}
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
        );
      })}
    </div>
  );
};

export default UniversalEmbedManager;
```

---

## 🎨 CSS Styling

```css
/* Universal Embed Styling */
.embed-wrapper {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.embed-caption {
  margin-bottom: 15px;
  font-style: italic;
  color: #666;
  text-align: center;
}

.embed-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* Platform-specific styling */
.embed-instagram,
.embed-twitter,
.embed-tiktok {
  max-width: 540px;
  margin: 0 auto;
}

.embed-youtube,
.embed-vimeo {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.embed-youtube iframe,
.embed-vimeo iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.embed-spotify,
.embed-soundcloud {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.embed-codepen {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.embed-google-maps {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .embed-wrapper {
    padding: 10px;
  }
  
  .embed-container {
    width: 100%;
  }
  
  .embed-instagram,
  .embed-twitter,
  .embed-tiktok {
    min-width: 100% !important;
    max-width: 100% !important;
  }
}

/* Advanced Options */
.btn-toggle-advanced {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 10px 0;
  font-size: 14px;
}

.advanced-options {
  margin-top: 15px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

---

## 📋 Supported Platforms

### Social Media
- ✅ Instagram
- ✅ Twitter/X
- ✅ Facebook
- ✅ TikTok
- ✅ LinkedIn
- ✅ Pinterest
- ✅ Snapchat

### Video
- ✅ YouTube
- ✅ Vimeo
- ✅ Dailymotion
- ✅ Twitch
- ✅ Wistia

### Audio
- ✅ Spotify
- ✅ SoundCloud
- ✅ Apple Music
- ✅ Bandcamp

### Code
- ✅ CodePen
- ✅ JSFiddle
- ✅ GitHub Gist
- ✅ CodeSandbox
- ✅ Repl.it

### Documents
- ✅ Google Docs
- ✅ Google Sheets
- ✅ Scribd
- ✅ SlideShare
- ✅ PDF embeds

### Maps
- ✅ Google Maps
- ✅ Mapbox
- ✅ OpenStreetMap

### Forms
- ✅ Google Forms
- ✅ Typeform
- ✅ JotForm

### Other
- ✅ Calendly
- ✅ Loom
- ✅ Figma
- ✅ **Any custom embed!**

---

## 🚀 Usage Examples

### Example 1: Instagram Post
```javascript
{
  type: 'instagram',
  url: 'https://www.instagram.com/p/ABC123/',
  caption: 'Check out this amazing post!'
}
```

### Example 2: YouTube Video
```javascript
{
  type: 'youtube',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  caption: 'Must watch video',
  width: '100%',
  height: '500px'
}
```

### Example 3: Spotify Playlist
```javascript
{
  type: 'spotify',
  url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  caption: 'Today\'s Top Hits'
}
```

### Example 4: Custom Embed Code
```javascript
{
  type: 'custom',
  embedCode: '<iframe src="https://example.com/embed" width="600" height="400"></iframe>',
  caption: 'Custom embedded content'
}
```

### Example 5: Google Maps
```javascript
{
  type: 'google-maps',
  url: 'https://www.google.com/maps/embed?pb=!1m18!1m12...',
  caption: 'Our office location',
  width: '100%',
  height: '450px'
}
```

---

## 📤 API Request Example

```javascript
const articleData = {
  title: 'Article with Multiple Embeds',
  content: '<p>Check out these embeds...</p>',
  excerpt: 'Article featuring various embedded content',
  categoryId: '507f1f77bcf86cd799439011',
  authorId: '507f1f77bcf86cd799439012',
  embeds: [
    {
      type: 'instagram',
      url: 'https://www.instagram.com/p/ABC123/',
      caption: 'Instagram post'
    },
    {
      type: 'youtube',
      url: 'https://www.youtube.com/watch?v=ABC123',
      width: '100%',
      height: '500px'
    },
    {
      type: 'spotify',
      url: 'https://open.spotify.com/track/ABC123'
    },
    {
      type: 'custom',
      embedCode: '<div>Custom HTML embed</div>',
      caption: 'Custom content'
    }
  ]
};

fetch('/api/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(articleData)
});
```

---

## ✅ Benefits of Universal System

1. **Flexibility** - Support any platform, not limited to predefined list
2. **Future-proof** - New platforms work automatically
3. **Custom embeds** - Can embed anything with custom HTML
4. **Easy to extend** - Just add new platform handlers as needed
5. **Backward compatible** - Existing embeds still work

---

## 🎉 Result

Your articles can now embed **ANYTHING**:
- Social media posts from any platform
- Videos from any service
- Audio players
- Interactive maps
- Code snippets
- Documents
- Forms
- Custom HTML embeds
- And literally anything else!

The system is completely flexible and future-proof! 🚀
