# 🔴 Live News & Updates Feature

## ✅ Backend Complete!

A complete real-time live updates system for breaking news, sports scores, weather updates, traffic reports, elections, and more.

---

## 🎯 Features

### What You Can Do:
- ✅ Create live updates (cricket scores, breaking news, etc.)
- ✅ Add real-time updates to ongoing events
- ✅ Set priority levels (1-5)
- ✅ Auto-refresh on frontend
- ✅ Pin important updates to top
- ✅ Show/hide on homepage
- ✅ Pause and resume updates
- ✅ End live coverage
- ✅ Track view counts
- ✅ Add metadata (scores, location, temperature, etc.)

### Update Types:
- 🔴 **Breaking** - Breaking news
- ⚽ **Sports** - Live sports scores, cricket matches
- 🌤️ **Weather** - Weather updates, hurricane tracking
- 🚗 **Traffic** - Traffic reports, road closures
- 🗳️ **Election** - Election results, vote counting
- 📰 **General** - General live updates

---

## 📊 Data Structure

```typescript
{
  id: string,
  title: string,                    // "Live: Cricket Match - Team A vs Team B"
  content: string,                  // Initial content
  type: 'breaking' | 'sports' | 'weather' | 'traffic' | 'election' | 'general',
  status: 'active' | 'paused' | 'ended',
  priority: number,                 // 1-5 (5 = highest)
  category: ObjectId,               // Optional category
  tags: string[],
  author: ObjectId,
  updates: [{
    timestamp: Date,
    content: string,
    author: ObjectId,
    attachments: string[]
  }],
  metadata: {
    score: string,                  // "Team A 2 - 1 Team B"
    location: string,               // "Roseau, Dominica"
    temperature: string,            // "28°C"
    participants: string[]          // ["Team A", "Team B"]
  },
  startedAt: Date,
  endedAt: Date,
  autoRefresh: boolean,             // Auto-refresh on frontend
  refreshInterval: number,          // Seconds (10-300)
  isSticky: boolean,                // Pin to top
  showOnHomepage: boolean,
  viewCount: number
}
```

---

## 🔌 API Endpoints

### Public Endpoints

**Get All Live Updates:**
```
GET /api/live-updates?status=active&type=sports&page=1&limit=10
```

**Get Active Live Updates (Homepage):**
```
GET /api/live-updates/active?limit=5
```

**Get Live Updates by Type:**
```
GET /api/live-updates/type/sports?limit=10
```

**Get Single Live Update:**
```
GET /api/live-updates/:id
```

### Protected Endpoints (Editor/Admin)

**Create Live Update:**
```
POST /api/admin/live-updates
{
  "title": "Live: Cricket Match - Dominica vs Jamaica",
  "content": "Match starting soon at Windsor Park",
  "type": "sports",
  "priority": 5,
  "authorId": "author-id",
  "categoryId": "sports-category-id",
  "tags": ["cricket", "sports", "live"],
  "metadata": {
    "score": "0 - 0",
    "location": "Windsor Park, Roseau",
    "participants": ["Dominica", "Jamaica"]
  },
  "autoRefresh": true,
  "refreshInterval": 30,
  "isSticky": true,
  "showOnHomepage": true
}
```

**Add Update to Live Event:**
```
POST /api/admin/live-updates/:id/updates
{
  "content": "WICKET! Player out for 45 runs",
  "authorId": "author-id",
  "attachments": ["image-url.jpg"]
}
```

**Update Live Update:**
```
PUT /api/admin/live-updates/:id
{
  "metadata": {
    "score": "Dominica 150/3 - Jamaica 120/5"
  },
  "status": "active"
}
```

**End Live Update:**
```
PUT /api/admin/live-updates/:id
{
  "status": "ended"
}
```

**Delete Live Update:**
```
DELETE /api/admin/live-updates/:id
```

---

## 🎨 Frontend Implementation

### 1. Live Updates Manager (Admin Panel)

```tsx
import { useState, useEffect } from 'react';

const LiveUpdatesManager = () => {
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    fetchLiveUpdates();
  }, []);

  const fetchLiveUpdates = async () => {
    const response = await fetch('/api/admin/live-updates');
    const result = await response.json();
    if (result.success) {
      setLiveUpdates(result.data);
    }
  };

  const createLiveUpdate = async (data) => {
    const response = await fetch('/api/admin/live-updates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
      fetchLiveUpdates();
      alert('Live update created!');
    }
  };

  const addUpdate = async (liveUpdateId, content) => {
    const response = await fetch(`/api/admin/live-updates/${liveUpdateId}/updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        authorId: currentUser.id
      })
    });

    const result = await response.json();
    if (result.success) {
      fetchLiveUpdates();
    }
  };

  const endLiveUpdate = async (id) => {
    const response = await fetch(`/api/admin/live-updates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'ended' })
    });

    if (response.ok) {
      fetchLiveUpdates();
    }
  };

  return (
    <div className="live-updates-manager">
      <h1>Live Updates Manager</h1>

      <button onClick={() => setShowCreateForm(true)}>
        🔴 Create Live Update
      </button>

      <div className="live-updates-list">
        {liveUpdates.map(update => (
          <div key={update.id} className="live-update-card">
            <div className="header">
              <span className={`status-badge ${update.status}`}>
                {update.status}
              </span>
              <span className={`type-badge ${update.type}`}>
                {update.type}
              </span>
              <span className="priority">Priority: {update.priority}</span>
            </div>

            <h3>{update.title}</h3>

            {update.metadata?.score && (
              <div className="score">{update.metadata.score}</div>
            )}

            <div className="stats">
              <span>{update.updateCount} updates</span>
              <span>{update.viewCount} views</span>
              <span>Started: {new Date(update.startedAt).toLocaleString()}</span>
            </div>

            <div className="actions">
              <button onClick={() => setSelectedUpdate(update)}>
                Add Update
              </button>
              <button onClick={() => endLiveUpdate(update.id)}>
                End Live
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Update Modal */}
      {selectedUpdate && (
        <div className="modal">
          <h3>Add Update to: {selectedUpdate.title}</h3>
          <textarea
            placeholder="What's happening now?"
            value={newUpdateContent}
            onChange={(e) => setNewUpdateContent(e.target.value)}
          />
          <button onClick={() => {
            addUpdate(selectedUpdate.id, newUpdateContent);
            setSelectedUpdate(null);
            setNewUpdateContent('');
          }}>
            Post Update
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveUpdatesManager;
```

### 2. Live Update Display (Frontend)

```tsx
import { useState, useEffect } from 'react';

const LiveUpdateView = ({ liveUpdateId }) => {
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    fetchLiveUpdate();

    // Auto-refresh if enabled
    if (liveUpdate?.autoRefresh && liveUpdate?.status === 'active') {
      const interval = setInterval(() => {
        fetchLiveUpdate();
      }, (liveUpdate.refreshInterval || 30) * 1000);

      return () => clearInterval(interval);
    }
  }, [liveUpdateId, liveUpdate?.autoRefresh]);

  const fetchLiveUpdate = async () => {
    const response = await fetch(`/api/live-updates/${liveUpdateId}`);
    const result = await response.json();
    if (result.success) {
      setLiveUpdate(result.data);
    }
  };

  if (!liveUpdate) return <div>Loading...</div>;

  return (
    <div className="live-update-view">
      {/* Header */}
      <div className="live-header">
        <span className="live-badge">🔴 LIVE</span>
        <h1>{liveUpdate.title}</h1>
        {liveUpdate.metadata?.score && (
          <div className="score-display">{liveUpdate.metadata.score}</div>
        )}
      </div>

      {/* Metadata */}
      {liveUpdate.metadata && (
        <div className="metadata">
          {liveUpdate.metadata.location && (
            <span>📍 {liveUpdate.metadata.location}</span>
          )}
          {liveUpdate.metadata.temperature && (
            <span>🌡️ {liveUpdate.metadata.temperature}</span>
          )}
        </div>
      )}

      {/* Updates Timeline */}
      <div className="updates-timeline">
        <h2>Live Updates</h2>
        {liveUpdate.updates.slice().reverse().map((update, index) => (
          <div key={index} className="update-item">
            <div className="timestamp">
              {new Date(update.timestamp).toLocaleTimeString()}
            </div>
            <div className="content">{update.content}</div>
            {update.attachments && update.attachments.length > 0 && (
              <div className="attachments">
                {update.attachments.map((url, i) => (
                  <img key={i} src={url} alt="Update attachment" />
                ))}
              </div>
            )}
            <div className="author">
              By {update.author.name}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      {liveUpdate.autoRefresh && liveUpdate.status === 'active' && (
        <div className="auto-refresh-indicator">
          Auto-refreshing every {liveUpdate.refreshInterval}s
        </div>
      )}
    </div>
  );
};

export default LiveUpdateView;
```

### 3. Homepage Live Updates Widget

```tsx
const LiveUpdatesWidget = () => {
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    fetchActiveLiveUpdates();

    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveLiveUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveLiveUpdates = async () => {
    const response = await fetch('/api/live-updates/active?limit=3');
    const result = await response.json();
    if (result.success) {
      setLiveUpdates(result.data);
    }
  };

  if (liveUpdates.length === 0) return null;

  return (
    <div className="live-updates-widget">
      <h2>🔴 Live Now</h2>
      {liveUpdates.map(update => (
        <Link
          key={update.id}
          to={`/live/${update.id}`}
          className="live-update-card"
        >
          <span className="live-badge">LIVE</span>
          <h3>{update.title}</h3>
          {update.metadata?.score && (
            <div className="score">{update.metadata.score}</div>
          )}
          <span className="type-badge">{update.type}</span>
        </Link>
      ))}
    </div>
  );
};

export default LiveUpdatesWidget;
```

---

## 🎨 CSS Styling

```css
/* Live Badge */
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  background: #ff0000;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Live Update Card */
.live-update-card {
  padding: 20px;
  background: #fff;
  border-left: 4px solid #ff0000;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.live-update-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* Score Display */
.score-display {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  margin: 15px 0;
}

/* Updates Timeline */
.updates-timeline {
  margin-top: 30px;
}

.update-item {
  padding: 15px;
  border-left: 3px solid #007bff;
  margin-bottom: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.update-item .timestamp {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
}

.update-item .content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
}

.update-item .author {
  font-size: 12px;
  color: #999;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #28a745;
  color: white;
}

.status-badge.paused {
  background: #ffc107;
  color: #333;
}

.status-badge.ended {
  background: #6c757d;
  color: white;
}

/* Type Badges */
.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.breaking { background: #dc3545; color: white; }
.type-badge.sports { background: #28a745; color: white; }
.type-badge.weather { background: #17a2b8; color: white; }
.type-badge.traffic { background: #ffc107; color: #333; }
.type-badge.election { background: #6f42c1; color: white; }
.type-badge.general { background: #6c757d; color: white; }

/* Auto-refresh Indicator */
.auto-refresh-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 📋 Use Cases

### 1. Cricket Match
```javascript
{
  title: "Live: Cricket - Dominica vs Jamaica",
  type: "sports",
  metadata: {
    score: "Dominica 150/3 (25 overs) - Jamaica 120/5 (20 overs)",
    location: "Windsor Park, Roseau",
    participants: ["Dominica", "Jamaica"]
  }
}
```

### 2. Hurricane Tracking
```javascript
{
  title: "Live: Hurricane Maria Updates",
  type: "weather",
  metadata: {
    location: "Eastern Caribbean",
    temperature: "28°C",
    participants: ["Category 5 Hurricane"]
  }
}
```

### 3. Election Results
```javascript
{
  title: "Live: General Election Results 2024",
  type: "election",
  metadata: {
    participants: ["Party A", "Party B", "Party C"]
  }
}
```

### 4. Breaking News
```javascript
{
  title: "Live: Breaking News - Major Announcement",
  type: "breaking",
  priority: 5,
  isSticky: true
}
```

---

## ✅ Summary

**Backend Status:** ✅ Complete  
**Build Status:** ✅ Successful  
**Ready to Use:** ✅ YES

**Features:**
- ✅ Create/manage live updates
- ✅ Real-time updates timeline
- ✅ Auto-refresh capability
- ✅ Multiple update types
- ✅ Priority system
- ✅ Metadata support (scores, location, etc.)
- ✅ View tracking
- ✅ Sticky/homepage display

**Frontend needs to implement:**
1. Live Updates Manager (admin panel)
2. Live Update Display (public view)
3. Homepage widget
4. Auto-refresh functionality

---

**Backend is ready! Start implementing the frontend live updates feature.** 🔴🚀
