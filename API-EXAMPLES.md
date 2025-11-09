# API Request/Response Examples

## 🔐 Authentication

All protected endpoints require authentication header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📝 Create Article with All Features

### Request
```http
POST /api/articles
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Breaking News: Major Event in Dominica",
  "content": "<p>Full article content with HTML formatting...</p>",
  "excerpt": "A brief summary of the article that appears in listings and previews",
  "featuredImage": "https://your-cdn.com/images/featured.jpg",
  "featuredImageAlt": "Description of the featured image",
  "categoryId": "507f1f77bcf86cd799439011",
  "authorId": "507f1f77bcf86cd799439012",
  "tags": ["breaking", "politics", "dominica"],
  "status": "published",
  "embeds": [
    {
      "type": "instagram",
      "url": "https://www.instagram.com/p/ABC123/",
      "embedCode": "<blockquote class=\"instagram-media\" data-instgrm-permalink=\"https://www.instagram.com/p/ABC123/\">...</blockquote>"
    }
  ],
  "gallery": [
    "https://your-cdn.com/images/gallery1.jpg",
    "https://your-cdn.com/images/gallery2.jpg"
  ],
  "isBreaking": true,
  "isFeatured": false,
  "isPinned": false,
  "location": "Roseau, Dominica",
  "language": "en",
  "seoTitle": "Breaking News: Major Event in Dominica | Your Site",
  "seoDescription": "Latest updates on the major event happening in Dominica today"
}
```

### Response
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "title": "Breaking News: Major Event in Dominica",
    "slug": "breaking-news-major-event-in-dominica",
    "content": "<p>Full article content with HTML formatting...</p>",
    "excerpt": "A brief summary of the article that appears in listings and previews",
    "featuredImage": "https://your-cdn.com/images/featured.jpg",
    "featuredImageAlt": "Description of the featured image",
    "embeds": [
      {
        "type": "instagram",
        "url": "https://www.instagram.com/p/ABC123/",
        "embedCode": "<blockquote class=\"instagram-media\">...</blockquote>",
        "_id": "507f1f77bcf86cd799439014"
      }
    ],
    "gallery": [
      "https://your-cdn.com/images/gallery1.jpg",
      "https://your-cdn.com/images/gallery2.jpg"
    ],
    "author": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://your-cdn.com/avatars/john.jpg"
    },
    "category": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Politics",
      "slug": "politics",
      "color": "#FF5733"
    },
    "tags": ["breaking", "politics", "dominica"],
    "status": "published",
    "publishedAt": "2024-11-09T14:30:00.000Z",
    "scheduledFor": null,
    "views": 0,
    "likes": 0,
    "shares": 0,
    "isBreaking": true,
    "isFeatured": false,
    "isPinned": false,
    "readingTime": 5,
    "location": "Roseau, Dominica",
    "language": "en",
    "seo": {
      "metaTitle": "Breaking News: Major Event in Dominica | Your Site",
      "metaDescription": "Latest updates on the major event happening in Dominica today"
    },
    "createdAt": "2024-11-09T14:30:00.000Z",
    "updatedAt": "2024-11-09T14:30:00.000Z",
    "url": "/articles/breaking-news-major-event-in-dominica"
  }
}
```

---

## 📅 Create Scheduled Article

### Request
```http
POST /api/articles
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Upcoming Event Coverage",
  "content": "<p>Article content...</p>",
  "excerpt": "Preview of upcoming event",
  "categoryId": "507f1f77bcf86cd799439011",
  "authorId": "507f1f77bcf86cd799439012",
  "status": "scheduled",
  "scheduledAt": "2024-11-10T09:00:00.000Z"
}
```

### Response
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "title": "Upcoming Event Coverage",
    "status": "scheduled",
    "scheduledFor": "2024-11-10T09:00:00.000Z",
    "publishedAt": null,
    ...
  }
}
```

---

## 🔍 Get Article by ID (For Editing)

### Request
```http
GET /api/articles/id/507f1f77bcf86cd799439013
Authorization: Bearer <token>
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "title": "Breaking News: Major Event in Dominica",
    "slug": "breaking-news-major-event-in-dominica",
    "content": "<p>Full article content...</p>",
    "excerpt": "A brief summary of the article",
    "featuredImage": "https://your-cdn.com/images/featured.jpg",
    "embeds": [
      {
        "type": "instagram",
        "url": "https://www.instagram.com/p/ABC123/",
        "embedCode": "<blockquote>...</blockquote>"
      }
    ],
    "gallery": ["image1.jpg", "image2.jpg"],
    "author": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "category": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Politics",
      "slug": "politics",
      "color": "#FF5733"
    },
    "tags": ["breaking", "politics"],
    "status": "published",
    "publishedAt": "2024-11-09T14:30:00.000Z",
    ...
  }
}
```

---

## ✏️ Update Article

### Request
```http
PUT /api/articles/507f1f77bcf86cd799439013
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "excerpt": "Updated excerpt",
  "embeds": [
    {
      "type": "instagram",
      "url": "https://www.instagram.com/p/NEW123/"
    },
    {
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=ABC123"
    }
  ],
  "status": "published"
}
```

### Response
```json
{
  "success": true,
  "message": "Article updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "title": "Updated Title",
    "excerpt": "Updated excerpt",
    "embeds": [
      {
        "type": "instagram",
        "url": "https://www.instagram.com/p/NEW123/",
        "_id": "507f1f77bcf86cd799439016"
      },
      {
        "type": "youtube",
        "url": "https://www.youtube.com/watch?v=ABC123",
        "_id": "507f1f77bcf86cd799439017"
      }
    ],
    "status": "published",
    "updatedAt": "2024-11-09T15:00:00.000Z",
    ...
  }
}
```

---

## 📂 Get Articles by Category

### Request
```http
GET /api/articles/category/politics?page=1&limit=12&status=published
```

### Response
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Politics",
      "slug": "politics",
      "color": "#FF5733",
      "description": "Political news and updates"
    },
    "articles": [
      {
        "id": "507f1f77bcf86cd799439013",
        "title": "Breaking News: Major Event in Dominica",
        "slug": "breaking-news-major-event-in-dominica",
        "excerpt": "A brief summary of the article",
        "featuredImage": "https://your-cdn.com/images/featured.jpg",
        "author": {
          "id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "avatar": "https://your-cdn.com/avatars/john.jpg"
        },
        "category": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Politics",
          "slug": "politics",
          "color": "#FF5733"
        },
        "status": "published",
        "publishedAt": "2024-11-09T14:30:00.000Z",
        "views": 150,
        "readingTime": 5,
        "isBreaking": true,
        "isFeatured": false,
        "isPinned": false
      }
      // ... more articles
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalArticles": 35,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 12
    }
  }
}
```

---

## 🔥 Get Breaking News

### Request
```http
GET /api/articles/breaking
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "Breaking News: Major Event in Dominica",
      "slug": "breaking-news-major-event-in-dominica",
      "excerpt": "A brief summary",
      "featuredImage": "https://your-cdn.com/images/featured.jpg",
      "author": {
        "id": "507f1f77bcf86cd799439012",
        "name": "John Doe"
      },
      "category": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Politics",
        "color": "#FF5733"
      },
      "publishedAt": "2024-11-09T14:30:00.000Z",
      "isBreaking": true
    }
    // ... up to 5 breaking news articles
  ]
}
```

---

## ⭐ Get Featured Articles

### Request
```http
GET /api/articles/featured
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439018",
      "title": "Featured Story Title",
      "slug": "featured-story-title",
      "excerpt": "Featured article excerpt",
      "featuredImage": "https://your-cdn.com/images/featured2.jpg",
      "author": {
        "id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "avatar": "https://your-cdn.com/avatars/john.jpg"
      },
      "category": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Politics",
        "color": "#FF5733"
      },
      "publishedAt": "2024-11-09T12:00:00.000Z",
      "views": 500,
      "isFeatured": true
    }
    // ... up to 6 featured articles
  ]
}
```

---

## 📌 Get Pinned Articles

### Request
```http
GET /api/articles/pinned?limit=5
```

### Response
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "507f1f77bcf86cd799439019",
        "title": "Important Pinned Article",
        "slug": "important-pinned-article",
        "excerpt": "This article stays at the top",
        "featuredImage": "https://your-cdn.com/images/pinned.jpg",
        "author": {
          "id": "507f1f77bcf86cd799439012",
          "name": "John Doe"
        },
        "category": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Politics",
          "color": "#FF5733"
        },
        "publishedAt": "2024-11-08T10:00:00.000Z",
        "isPinned": true
      }
    ],
    "count": 1
  }
}
```

---

## 🗑️ Delete Article

### Request
```http
DELETE /api/articles/507f1f77bcf86cd799439013
Authorization: Bearer <admin-token>
```

### Response
```json
{
  "success": true,
  "message": "Article moved to recycle bin"
}
```

---

## 🚀 Manually Publish Scheduled Articles (Admin Only)

### Request
```http
POST /api/admin/publish-scheduled
Authorization: Bearer <admin-token>
```

### Response
```json
{
  "success": true,
  "message": "Published 3 articles",
  "count": 3,
  "articles": [
    {
      "id": "507f1f77bcf86cd799439015",
      "title": "Upcoming Event Coverage"
    },
    {
      "id": "507f1f77bcf86cd799439020",
      "title": "Another Scheduled Article"
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "title": "Third Scheduled Article"
    }
  ]
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Author not found"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Article not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error creating article",
  "error": "Detailed error message"
}
```

---

## 📋 Field Validation Rules

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| title | string | Yes | 200 | Min 5 characters |
| content | string | Yes | - | HTML allowed |
| excerpt | string | No | 300 | Plain text |
| featuredImage | string | No | - | URL |
| categoryId | ObjectId | Yes | - | Must exist |
| authorId | ObjectId | Yes | - | Must exist |
| tags | string[] | No | - | Lowercase |
| status | enum | No | - | draft/published/scheduled/archived |
| embeds | array | No | - | See embed structure |
| language | enum | No | - | en/es (default: en) |

### Embed Structure
```typescript
{
  type: 'instagram' | 'twitter' | 'youtube' | 'facebook' | 'tiktok',
  url: string (required),
  embedCode: string (optional)
}
```

---

## 🎯 Quick Copy-Paste Examples

### JavaScript/Fetch
```javascript
// Create article
const response = await fetch('/api/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Article',
    content: '<p>Content</p>',
    excerpt: 'Brief summary',
    categoryId: '507f1f77bcf86cd799439011',
    authorId: '507f1f77bcf86cd799439012',
    status: 'published',
    embeds: [{
      type: 'instagram',
      url: 'https://www.instagram.com/p/ABC123/'
    }]
  })
});
const data = await response.json();
```

### Axios
```javascript
// Update article
const { data } = await axios.put(
  `/api/articles/${articleId}`,
  {
    title: 'Updated Title',
    excerpt: 'Updated excerpt',
    embeds: [{ type: 'instagram', url: 'https://...' }]
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

### jQuery
```javascript
// Get article by ID
$.ajax({
  url: `/api/articles/id/${articleId}`,
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` },
  success: function(response) {
    console.log(response.data);
  }
});
```
