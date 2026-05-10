# Troubleshooting Guide

## 500 Internal Server Error

If you're getting a 500 error from the backend, here's how to debug it:

### 1. Check the Request Format

The frontend is sending:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Verify this matches your backend's expected format** by checking:
- Your backend's Swagger or API documentation
- Look for the `/auth/login` endpoint
- Check the request body schema

### 2. Common Causes of 500 Errors

#### Backend Issues:
- **Database connection problems** - Check if your database is accessible
- **Missing environment variables** - Verify all required env vars are set on Render
- **Code errors** - Check backend logs on Render dashboard
- **Validation errors** - Backend might be failing validation silently

#### Request Format Issues:
- **Field name mismatch** - Backend might expect `email` vs `username`
- **Missing required fields** - Backend might require additional fields
- **Content-Type issues** - Though we're sending `application/json` correctly

### 3. Debugging Steps

1. **Check Browser Console:**
   - Look for "API Request" log - verify the request body
   - Look for "API Error" log - see the full server response
   - Look for "Login error details" - see the parsed error

2. **Check Backend Logs:**
   - Go to Render dashboard
   - Check the logs for your backend service
   - Look for error stack traces

3. **Test with Swagger/Postman:**
   - Use your backend's Swagger UI or Postman collection
   - Try the login endpoint directly
   - Compare the request format

4. **Verify Backend Health:**
   - Check that the host in `VITE_API_BASE_URL` is reachable
   - Check that your backend docs or health endpoint is accessible

### 4. Quick Fixes to Try

1. **Verify .env file:**
   ```env
   VITE_API_BASE_URL=<your-backend-origin>
   ```

2. **Check if backend needs `/api` prefix:**
   If your backend is mounted under `/api`, include the prefix:
   ```env
   VITE_API_BASE_URL=<your-backend-api-base-url>
   ```

3. **Try a different endpoint:**
   Test with a simpler endpoint first (like health check)

4. **Check CORS:**
   Make sure backend allows requests from your frontend domain

### 5. Contact Backend Team

If the issue persists, provide them with:
- The exact request being sent (from console logs)
- The error response (from console logs)
- Backend logs from Render
- Steps to reproduce

## Other Common Errors

### 401 Unauthorized
- Invalid credentials
- Token expired
- Wrong email/password

### 404 Not Found
- Wrong endpoint URL
- Backend route doesn't exist
- Missing `/api` prefix

### Network Errors
- Backend server is down
- CORS issues
- Firewall blocking requests
