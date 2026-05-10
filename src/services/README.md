# EVOA API Services

Professional API service layer for EVOA - Startup Discovery & Pitch Platform.

## Overview

This services folder contains all API integration code organized by feature domain. All services use a centralized API client with authentication, error handling, and request/response interceptors.

## Structure

```
services/
├── apiClient.js          # Centralized HTTP client configuration
├── authService.js        # Authentication & authorization
├── reelsService.js       # Feed system & reel interactions
├── pitchService.js       # Pitch details & investor features
├── meetingsService.js    # Meeting scheduling & management
├── startupsService.js    # Startup management & following
├── exploreService.js     # Search, trending & discovery
├── notificationsService.js # User notifications
├── usersService.js       # User profile management
├── index.js              # Central export point
└── README.md             # This file
```

## Configuration

### Environment Variables

**⚠️ IMPORTANT:** You must configure the API base URL before using the services.

1. Copy the `env.example` file to `.env` in the project root:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your API URL:
   ```env
   VITE_API_BASE_URL=<your-backend-api-base-url>
   
   # Example:
   # VITE_API_BASE_URL=https://your-backend-host/api
   ```

3. **Restart your development server** after creating/updating the `.env` file.

**Note:** If `VITE_API_BASE_URL` is not set, the API client will show a warning and all API calls will fail with a clear error message.

## Usage

### Import Services

```javascript
// Import specific service
import { authService } from '../services';
import { reelsService } from '../services';

// Or import specific functions
import { login, signup } from '../services';
import { getFeed, likeReel } from '../services';
```

### Authentication Example

```javascript
import { login, signup, logout, isAuthenticated } from '../services';

// Login
try {
  const response = await login({
    email: 'user@example.com',
    password: 'Password123!'
  });
  console.log('Login successful:', response.data);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Signup
try {
  const response = await signup({
    email: 'user@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
    role: 'viewer'
  });
  console.log('Signup successful:', response.data);
} catch (error) {
  console.error('Signup failed:', error.message);
}

// Logout
logout();

// Check authentication
if (isAuthenticated()) {
  // User is logged in
}
```

### Reels/Feed Example

```javascript
import { getFeed, likeReel, commentOnReel } from '../services';

// Get feed
try {
  const response = await getFeed({
    type: 'for_you', // or 'following'
    cursor: 'optional-cursor',
    limit: 20
  });
  console.log('Feed:', response.data);
} catch (error) {
  console.error('Failed to load feed:', error.message);
}

// Like a reel
try {
  await likeReel('reel-id-123');
  console.log('Reel liked');
} catch (error) {
  console.error('Failed to like:', error.message);
}

// Comment on a reel
try {
  const response = await commentOnReel('reel-id-123', {
    content: 'Great pitch!',
    parentCommentId: 'optional-parent-id' // for replies
  });
  console.log('Comment created:', response.data);
} catch (error) {
  console.error('Failed to comment:', error.message);
}
```

### Pitch Example

```javascript
import { getPitchDetails, getAIAnalysis, scheduleMeeting } from '../services';

// Get pitch details
try {
  const response = await getPitchDetails('pitch-id-123');
  console.log('Pitch:', response.data);
} catch (error) {
  console.error('Failed to load pitch:', error.message);
}

// Get AI analysis (Investor/Incubator only)
try {
  const response = await getAIAnalysis('startup-id-123');
  console.log('AI Analysis:', response.data);
} catch (error) {
  console.error('Failed to get analysis:', error.message);
}

// Schedule meeting (Investor/Incubator only)
try {
  const response = await scheduleMeeting('startup-id-123', {
    notes: 'Interested in discussing partnership',
    scheduledAt: '2026-01-20T11:02:27.916Z'
  });
  console.log('Meeting scheduled:', response.data);
} catch (error) {
  console.error('Failed to schedule meeting:', error.message);
}
```

### React Component Example

```javascript
import { useState, useEffect } from 'react';
import { getFeed, likeReel } from '../services';

function FeedComponent() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFeed({ type: 'for_you', limit: 20 });
      setFeed(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId) => {
    try {
      await likeReel(reelId);
      // Update local state
      setFeed(prev => prev.map(reel => 
        reel.id === reelId 
          ? { ...reel, liked: true, likes: reel.likes + 1 }
          : reel
      ));
    } catch (err) {
      console.error('Failed to like:', err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {feed.map(reel => (
        <div key={reel.id}>
          <p>{reel.description}</p>
          <button onClick={() => handleLike(reel.id)}>
            Like ({reel.likes})
          </button>
        </div>
      ))}
    </div>
  );
}
```

## API Client Features

### Automatic Authentication
- Tokens are automatically included in requests when available
- Token is stored in localStorage
- Use `requiresAuth: false` option to disable auth for public endpoints

### Error Handling
All services return consistent error objects:
```javascript
{
  error: true,
  status: 401,
  message: 'Invalid credentials',
  data: null
}
```

### Response Format
Successful responses:
```javascript
{
  error: false,
  status: 200,
  data: { /* response data */ }
}
```

## Available Services

### Auth Service
- `signup(userData)` - Register new user
- `login(credentials)` - Login with email/password
- `googleAuth(googleData)` - Authenticate with Google
- `forgotPassword(data)` - Send password reset email
- `logout()` - Clear auth data
- `isAuthenticated()` - Check if user is authenticated

### Reels Service
- `getFeed(params)` - Get feed (for_you/following)
- `likeReel(reelId)` - Like a reel
- `unlikeReel(reelId)` - Unlike a reel
- `commentOnReel(reelId, commentData)` - Comment on reel
- `getReelComments(reelId)` - Get reel comments
- `shareReel(reelId, shareData)` - Share a reel

### Pitch Service
- `getPitchDetails(pitchId)` - Get full pitch details
- `getAIAnalysis(startupId)` - Get AI analysis (Investor/Incubator)
- `scheduleMeeting(startupId, meetingData)` - Schedule meeting (Investor/Incubator)

### Meetings Service
- `getMeetings()` - Get user meetings
- `acceptMeeting(meetingId)` - Accept meeting (Founder)
- `rejectMeeting(meetingId)` - Reject meeting (Founder)

### Startups Service
- `getStartupDetails(startupId)` - Get startup details
- `followStartup(startupId)` - Follow a startup
- `unfollowStartup(startupId)` - Unfollow a startup
- `getFollowedStartups()` - Get followed startups

### Explore Service
- `search(params)` - Search startups/investors/hashtags
- `getTrendingHashtags()` - Get trending hashtags
- `getTopStartups()` - Get top performing startups
- `getStartupsOfWeek()` - Get startups of the week
- `getInvestorSpotlight()` - Get investor spotlight
- `getLiveBattleground()` - Get live battleground

### Notifications Service
- `getNotifications(params)` - Get user notifications
- `markNotificationAsRead(notificationId)` - Mark as read
- `markAllNotificationsAsRead()` - Mark all as read

### Users Service
- `getCurrentUserProfile()` - Get current user profile
- `updateUserProfile(profileData)` - Update user profile

## Best Practices

1. **Always use try-catch** when calling services
2. **Handle loading states** in your components
3. **Update local state** after successful API calls
4. **Check authentication** before making protected requests
5. **Use error messages** from API responses for user feedback
6. **Clear auth data** on logout or token expiration

## Error Codes

- `200` - Success
- `201` - Created
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (e.g., user already exists)
- `0` - Network error
