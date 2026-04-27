# EVOA Frontend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Backend

Create a `.env` file in the project root:

```bash
cp env.example .env
```

The `.env` file should contain:
```env
VITE_API_BASE_URL=https://evoa-backend.onrender.com/api
```

### 3. Start Development Server
```bash
npm run dev
```

## Backend Information

- **Staging Backend URL:** `https://evoa-backend.onrender.com`
- **Swagger API Documentation:** `https://evoa-backend.onrender.com/api`

## API Services

All API services are located in `src/services/`:

- `authService.js` - Authentication (login, signup, etc.)
- `reelsService.js` - Feed and reel interactions
- `pitchService.js` - Pitch details and investor features
- `meetingsService.js` - Meeting scheduling
- `startupsService.js` - Startup management
- `exploreService.js` - Search and discovery
- `notificationsService.js` - User notifications
- `usersService.js` - User profile management

## Usage Example

```javascript
import { login, getFeed } from './services';

// Login
const response = await login({
  email: 'user@example.com',
  password: 'Password123!'
});

// Get feed
const feed = await getFeed({ type: 'for_you', limit: 20 });
```

## Documentation

- **Services README:** `src/services/README.md`
- **Usage Examples:** `src/services/USAGE_EXAMPLES.md`

## Troubleshooting

### API Connection Errors

If you see `ERR_NAME_NOT_RESOLVED` or connection errors:

1. Check that `.env` file exists in the project root
2. Verify `VITE_API_BASE_URL` is set correctly
3. Restart the development server after creating/updating `.env`
4. Check the browser console for detailed error messages

### Environment Variables Not Loading

Vite requires a server restart to load new environment variables. After updating `.env`:
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev` again
