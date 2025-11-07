# � Fronteend Integration Guide - Dominica News Backend

## ✅ Backend Status: READY FOR PRODUCTION

Your backend is now fully operational with:
- ✅ 50,000,000 requests/minute rate limit
- ✅ Enhanced error handling
- ✅ Graceful shutdown
- ✅ MongoDB connection monitoring
- ✅ All admin features working
- ✅ CORS properly configured
- ✅ No login issues

---

## 🔗 API Base URLs

### Development
```
http://localhost:5000/api
```

### Production
```
https://your-backend-domain.com/api
```

---

## 🔐 Authentication

### Login Endpoint
```javascript
POST /api/auth/login

// Request
{
  "email": "admin@dominicanews.dm",
  "password": "your-password"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "admin@dominicanews.dm",
    "name": "Admin",
    "role": "admin"
  }
}
```

### Using the Token
Include the token in all authenticated requests:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📋 Frontend Setup

### 1. Environment Variables

Create a `.env` file in your frontend:

```env
# Development
VITE_API_URL=http://localhost:5000/api
# or for React
REACT_APP_API_URL=http://localhost:5000/api

# Production
VITE_API_URL=https://your-backend-domain.com/api
```

### 2. API Client Setup

#### Option A: Axios (Recommended)

```javascript
// src/api/client.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Option B: Fetch API

```javascript
// src/api/client.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
```

---

## 🎯 API Endpoints Reference

### 🔐 Authentication
```javascript
POST   /api/auth/login          // Login
POST   /api/auth/register       // Register new user
GET    /api/auth/me             // Get current user
POST   /api/auth/logout         // Logout
```

### 📰 Articles (Public)
```javascript
GET    /api/articles                    // Get all articles (paginated)
GET    /api/articles/:id                // Get single article
GET    /api/articles/slug/:slug         // Get article by slug
GET    /api/articles/category/:id       // Get articles by category
GET    /api/articles/author/:id         // Get articles by author
```

### 📰 Articles (Admin)
```javascript
GET    /api/admin/articles              // Get all articles (admin view)
POST   /api/admin/articles              // Create article
PUT    /api/admin/articles/:id          // Update article
DELETE /api/admin/articles/:id          // Delete article
PATCH  /api/admin/articles/:id/publish  // Publish article
PATCH  /api/admin/articles/:id/featured // Toggle featured
```

### 📁 Categories
```javascript
GET    /api/categories                  // Get all categories
GET    /api/categories/:id              // Get single category
POST   /api/admin/categories            // Create category
PUT    /api/admin/categories/:id        // Update category
DELETE /api/admin/categories/:id        // Delete category
```

### ✍️ Authors
```javascript
GET    /api/authors                     // Get all authors
GET    /api/authors/:id                 // Get single author
POST   /api/admin/authors               // Create author
PUT    /api/admin/authors/:id           // Update author
DELETE /api/admin/authors/:id           // Delete author
```

### 📄 Static Pages
```javascript
GET    /api/static-pages                // Get all pages
GET    /api/static-pages/slug/:slug     // Get page by slug
POST   /api/admin/static-pages          // Create page
PUT    /api/admin/static-pages/:id      // Update page
DELETE /api/admin/static-pages/:id      // Delete page
```

### 🚨 Breaking News
```javascript
GET    /api/breaking-news               // Get active breaking news
POST   /api/admin/breaking-news         // Create breaking news
PUT    /api/admin/breaking-news/:id     // Update breaking news
DELETE /api/admin/breaking-news/:id     // Delete breaking news
```

### 🖼️ Images
```javascript
POST   /api/admin/images/upload         // Upload image
GET    /api/images                      // Get all images
DELETE /api/admin/images/:id            // Delete image
```

### ⚙️ Settings
```javascript
GET    /api/settings                    // Get site settings
PUT    /api/admin/settings              // Update settings
```

### 🗑️ Recycle Bin
```javascript
GET    /api/admin/recycle-bin           // Get deleted items
POST   /api/admin/recycle-bin/:id/restore  // Restore item
DELETE /api/admin/recycle-bin/:id       // Permanently delete
```

### 📊 Analytics
```javascript
GET    /api/admin/analytics             // Get analytics data
GET    /api/admin/analytics/articles/:id  // Get article analytics
POST   /api/analytics/track             // Track page view
```

---

## 💡 Usage Examples

### Login Example
```javascript
import apiClient from './api/client';

async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### Fetch Articles Example
```javascript
async function getArticles(page = 1, limit = 10) {
  try {
    const response = await apiClient.get(
      `/articles?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    throw error;
  }
}
```

### Create Article Example
```javascript
async function createArticle(articleData) {
  try {
    const response = await apiClient.post('/admin/articles', {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category: articleData.categoryId,
      author: articleData.authorId,
      featuredImage: articleData.imageUrl,
      tags: articleData.tags,
      status: 'draft' // or 'published'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create article:', error);
    throw error;
  }
}
```

### Upload Image Example
```javascript
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post('/admin/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url; // Image URL
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}
```

---

## 🎨 React Hooks Examples

### useAuth Hook
```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
```

### useArticles Hook
```javascript
// src/hooks/useArticles.js
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export function useArticles(page = 1, limit = 10) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/articles?page=${page}&limit=${limit}`
        );
        setArticles(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [page, limit]);

  return { articles, loading, error, pagination };
}
```

---

## 🔒 Protected Routes Example

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Usage in App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🐛 Error Handling

### Global Error Handler
```javascript
// src/utils/errorHandler.js
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return { message: 'Invalid request. Please check your input.' };
      case 401:
        return { message: 'Please login to continue.' };
      case 403:
        return { message: 'You do not have permission to perform this action.' };
      case 404:
        return { message: 'Resource not found.' };
      case 500:
        return { message: 'Server error. Please try again later.' };
      default:
        return { message };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { message: error.message || 'An unexpected error occurred.' };
  }
}
```

---

## 📦 Response Format

All API responses follow this format:

### Success Response
```javascript
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful" // optional
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message" // in development only
}
```

### Paginated Response
```javascript
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🚀 Deployment Checklist

### Backend
- [x] Build passes (`npm run build`)
- [x] Environment variables set
- [x] MongoDB connection working
- [x] CORS configured for your frontend domain
- [x] Rate limiting set to 50,000,000/min
- [x] Error handling implemented
- [x] Graceful shutdown configured

### Frontend
- [ ] Update API_URL to production backend
- [ ] Add production domain to backend CORS
- [ ] Test all API endpoints
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test admin features

---

## 🔧 Troubleshooting

### CORS Issues
If you get CORS errors, make sure:
1. Your frontend URL is in the backend's CORS whitelist (src/app.ts)
2. You're using `withCredentials: true` in axios or `credentials: 'include'` in fetch
3. The backend is running and accessible

### Authentication Issues
If login doesn't work:
1. Check if token is being stored: `localStorage.getItem('token')`
2. Verify token is being sent in headers
3. Check backend logs for authentication errors
4. Ensure user exists in database

### 404 Errors
If endpoints return 404:
1. Verify the endpoint URL is correct
2. Check if you're using `/api/` prefix
3. Ensure the backend server is running
4. Check backend logs for route registration

---

## 📞 Support

If you encounter issues:
1. Check backend logs: `npm run dev` (shows detailed logs)
2. Check browser console for frontend errors
3. Use browser DevTools Network tab to inspect requests
4. Verify environment variables are set correctly

---

## ✅ Quick Start Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend (example)
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

**Your backend is ready! Start building your frontend with confidence.** 🎉
