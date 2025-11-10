# Homepage Categories Settings Feature

## ✅ Backend Updated

Added `homepageCategories` field to Settings model to allow customizing which categories appear on the homepage.

---

## What Was Added

### Settings Model (`src/models/Settings.ts`)

```typescript
{
  // ... existing fields
  homepageCategories: mongoose.Types.ObjectId[]  // ✅ NEW - Array of category IDs
}
```

---

## How It Works

### Store Homepage Categories
```typescript
PUT /api/settings
{
  "homepageCategories": [
    "category-id-1",
    "category-id-2",
    "category-id-3"
  ]
}
```

### Get Settings (includes homepage categories)
```typescript
GET /api/settings

Response:
{
  "success": true,
  "data": {
    "siteName": "Dominica News",
    "homepageCategories": [
      {
        "id": "...",
        "name": "Politics",
        "slug": "politics",
        "color": "#FF5733"
      },
      {
        "id": "...",
        "name": "Sports",
        "slug": "sports",
        "color": "#33FF57"
      }
    ]
  }
}
```

---

## Frontend Implementation

### 1. Settings Manager (Admin Panel)

```tsx
import { useState, useEffect } from 'react';

const HomepageSettings = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch('/api/categories');
    const result = await response.json();
    if (result.success) {
      setCategories(result.data);
    }
  };

  const fetchSettings = async () => {
    const response = await fetch('/api/settings');
    const result = await response.json();
    if (result.success) {
      setSettings(result.data);
      setSelectedCategories(result.data.homepageCategories?.map(c => c.id) || []);
    }
  };

  const handleToggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSave = async () => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        homepageCategories: selectedCategories
      })
    });

    const result = await response.json();
    if (result.success) {
      alert('Homepage categories updated!');
    }
  };

  return (
    <div className="homepage-settings">
      <h2>Homepage Categories</h2>
      <p>Select which categories to display on the homepage</p>

      <div className="category-list">
        {categories.map(category => (
          <label key={category.id} className="category-checkbox">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleToggleCategory(category.id)}
            />
            <span style={{ color: category.color }}>
              {category.icon} {category.name}
            </span>
          </label>
        ))}
      </div>

      <button onClick={handleSave} className="btn-save">
        Save Homepage Categories
      </button>
    </div>
  );
};

export default HomepageSettings;
```

### 2. Homepage Display

```tsx
import { useState, useEffect } from 'react';

const HomePage = () => {
  const [homepageCategories, setHomepageCategories] = useState([]);

  useEffect(() => {
    fetchHomepageCategories();
  }, []);

  const fetchHomepageCategories = async () => {
    const response = await fetch('/api/settings');
    const result = await response.json();

    if (result.success && result.data.homepageCategories) {
      setHomepageCategories(result.data.homepageCategories);
    } else {
      // Fallback: Show all categories if not configured
      const categoriesResponse = await fetch('/api/categories');
      const categoriesResult = await categoriesResponse.json();
      if (categoriesResult.success) {
        setHomepageCategories(categoriesResult.data);
      }
    }
  };

  return (
    <div className="homepage">
      <h1>Welcome to Dominica News</h1>

      {/* Display configured homepage categories */}
      <section className="homepage-categories">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          {homepageCategories.map(category => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="category-card"
              style={{ borderColor: category.color }}
            >
              <div 
                className="category-icon"
                style={{ backgroundColor: category.color }}
              >
                {category.icon || '📰'}
              </div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
```

---

## Use Cases

### 1. Featured Categories Only
Show only the most important categories on homepage:
- Politics
- Breaking News
- Local News

### 2. Seasonal Categories
Change homepage categories based on season:
- Add "Hurricane Season" during hurricane season
- Add "Carnival" during carnival season
- Remove when not relevant

### 3. Curated Experience
Control exactly what visitors see first:
- Highlight specific topics
- Promote new categories
- Hide less popular categories

---

## Benefits

✅ **Customizable** - Choose exactly which categories appear on homepage  
✅ **Flexible** - Easy to change anytime  
✅ **Clean** - Don't clutter homepage with all categories  
✅ **Fallback** - Shows all categories if not configured  
✅ **Admin Control** - Manage from admin panel  

---

## API Endpoints

### Get Settings
```
GET /api/settings
```

Returns settings including `homepageCategories` array (populated with full category objects).

### Update Settings
```
PUT /api/settings
{
  "homepageCategories": ["id1", "id2", "id3"]
}
```

Updates which categories appear on homepage.

---

## Database

### MongoDB (Already Using)
```javascript
// Settings document
{
  siteName: "Dominica News",
  siteDescription: "...",
  homepageCategories: [
    ObjectId("category-id-1"),
    ObjectId("category-id-2"),
    ObjectId("category-id-3")
  ]
}
```

The `homepageCategories` field stores an array of category ObjectIds that reference the Category collection.

---

## Testing

### 1. Update Homepage Categories
```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "homepageCategories": ["cat-id-1", "cat-id-2"]
  }'
```

### 2. Get Settings
```bash
curl http://localhost:5000/api/settings
```

Should return settings with `homepageCategories` populated.

### 3. Verify Homepage
Visit homepage and verify only selected categories appear.

---

## Summary

✅ **Backend:** Added `homepageCategories` field to Settings model  
✅ **Build:** Successful (0 errors)  
✅ **Ready:** Can be used immediately  

**Frontend needs to:**
1. Add settings page to select homepage categories
2. Update homepage to fetch and display selected categories
3. Add fallback to show all categories if not configured

---

**Backend is ready! Implement the frontend settings manager and homepage display.** 🚀
