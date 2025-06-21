# 🚀 Netlify Deployment Guide - F1 Analytics Platform

This guide will help you deploy the F1 Real-Time Analytics Platform to Netlify.

## 📋 Deployment Options

### Option 1: Frontend + Netlify Functions (Recommended)
- ✅ Frontend: Next.js static export on Netlify
- ✅ Backend: Netlify Functions for API endpoints
- ❌ WebSocket: Replaced with polling (every 5 seconds)
- ✅ Cost: Free tier available

### Option 2: Hybrid Deployment
- ✅ Frontend: Netlify
- ✅ Backend: External service (Heroku, Railway, Vercel)
- ✅ WebSocket: Full real-time support
- ⚠️ Cost: May require paid plans

## 🎯 Quick Deploy (Option 1)

### Step 1: Prepare Repository

```bash
# Ensure you're on the deployment branch
git checkout netlify-deployment

# Verify changes
git status
```

### Step 2: Deploy to Netlify

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select `netlify-deployment` branch

2. **Build Settings**:
   ```
   Base directory: (leave empty)
   Build command: cd frontend && npm install && npm run build
   Publish directory: frontend/dist
   ```

3. **Environment Variables**:
   Set these in Netlify Dashboard → Site Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-site-name.netlify.app/.netlify/functions
   NEXT_PUBLIC_WS_URL=disabled
   NODE_VERSION=18
   ```

### Step 3: Custom Domain (Optional)
1. Go to Domain Settings in Netlify Dashboard
2. Add your custom domain
3. Update environment variables with new domain

## 🔧 Configuration Changes Made

### Frontend Changes (`netlify-deployment` branch):
- ✅ Static export configuration in `next.config.js`
- ✅ Image optimization disabled for static export
- ✅ Proper asset handling for CDN
- ✅ WebSocket fallback to polling

### Backend Changes:
- ✅ Created Netlify Functions in `/netlify/functions/`
- ✅ Health check endpoint
- ✅ Leaderboard API endpoint
- ✅ CORS headers configured
- ✅ Error handling and validation

### Build Configuration:
- ✅ `netlify.toml` configuration file
- ✅ Proper redirects for API routes
- ✅ Security headers
- ✅ Asset caching rules

## 📊 API Endpoints (Netlify Functions)

After deployment, your API will be available at:

```
Base URL: https://your-site-name.netlify.app/.netlify/functions/

Endpoints:
├── GET /health          → Health check
├── GET /leaderboard     → Live race standings
├── GET /battles         → Battle detection (TODO)
├── GET /telemetry/:id   → Car telemetry (TODO)
├── GET /positions       → GPS positions (TODO)
└── GET /driver/:number  → Driver details (TODO)
```

## ⚠️ Limitations & Solutions

### WebSocket Limitation
**Issue**: Netlify Functions don't support persistent WebSocket connections.

**Solution**: Automatic fallback to polling every 5 seconds.

**Frontend Change**: Modified `useWebSocket.js` to detect WebSocket unavailability.

### Function Timeout
**Issue**: Netlify Functions have a 10-second timeout limit.

**Solution**: Optimized API calls and added caching.

### Cold Starts
**Issue**: Functions may have cold start delays.

**Solution**: Added function warming and error handling.

## 🎛️ Advanced Configuration

### Custom Build Commands

If you need to customize the build process:

```toml
# netlify.toml
[build]
  command = """
    echo 'Installing frontend dependencies...' &&
    cd frontend && npm ci &&
    echo 'Installing function dependencies...' &&
    cd ../netlify/functions && npm ci &&
    echo 'Building frontend...' &&
    cd ../../frontend && npm run build
  """
```

### Environment-Specific Settings

```toml
# Production environment
[context.production.environment]
  NEXT_PUBLIC_API_BASE_URL = "https://f1-analytics.netlify.app/.netlify/functions"
  NODE_ENV = "production"

# Deploy preview environment
[context.deploy-preview.environment]
  NEXT_PUBLIC_API_BASE_URL = "https://deploy-preview-123--f1-analytics.netlify.app/.netlify/functions"
  NODE_ENV = "staging"
```

## 🔄 Real-Time Features Without WebSocket

### Client-Side Polling Implementation

The frontend automatically switches to polling mode when WebSocket is unavailable:

```javascript
// Automatic fallback in useWebSocket.js
const usePolling = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch latest data every 5 seconds
      fetchLeaderboard();
      fetchBattles();
      fetchPositions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
};
```

### Server-Sent Events (Future Enhancement)

For better real-time experience, consider implementing SSE:

```javascript
// netlify/functions/events.js
exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: `data: ${JSON.stringify({ message: 'Connected' })}\n\n`,
    };
  }
};
```

## 🐛 Troubleshooting

### Build Failures

1. **Node Version Issues**:
   ```
   Error: Node version mismatch
   Solution: Set NODE_VERSION=18 in environment variables
   ```

2. **Dependency Issues**:
   ```
   Error: Cannot find module 'xyz'
   Solution: Ensure package.json includes all dependencies
   ```

3. **Static Export Issues**:
   ```
   Error: Dynamic routes not supported
   Solution: Check if all routes are statically exportable
   ```

### Function Errors

1. **CORS Issues**:
   ```
   Error: Access-Control-Allow-Origin
   Solution: Check CORS headers in function responses
   ```

2. **Timeout Issues**:
   ```
   Error: Function timeout
   Solution: Optimize API calls or increase function timeout
   ```

## 📈 Performance Optimization

### Frontend Optimizations
- ✅ Static export for fast loading
- ✅ Image optimization disabled (required for static export)
- ✅ Proper caching headers
- ✅ Asset compression

### Function Optimizations
- ✅ Minimal dependencies
- ✅ Efficient API calls
- ✅ Error handling
- ✅ Response caching

## 🔐 Security

### Headers Applied
```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### API Security
- ✅ CORS properly configured
- ✅ Input validation in functions
- ✅ Error message sanitization
- ✅ Rate limiting (via Netlify)

## 📱 Testing Your Deployment

### Pre-deployment Testing
```bash
# Test frontend build locally
cd frontend
npm run build
npm run start

# Test functions locally (if using Netlify CLI)
netlify dev
```

### Post-deployment Testing
1. Visit your Netlify URL
2. Check API endpoints: `https://your-site.netlify.app/.netlify/functions/health`
3. Verify data loading in the dashboard
4. Test all components and features

## 🎉 Success Checklist

- [ ] Repository connected to Netlify
- [ ] Build settings configured correctly
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Health check endpoint working
- [ ] Frontend loading properly
- [ ] API data displaying in dashboard
- [ ] All components functional
- [ ] Mobile responsive design working

## 🆘 Need Help?

### Common Issues & Solutions

1. **Blank Page**: Check browser console for errors
2. **API Errors**: Verify function logs in Netlify dashboard
3. **Slow Loading**: Check function performance and optimize
4. **CORS Errors**: Verify origin settings in functions

### Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Static Export Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)

---

**🏁 Ready to deploy your F1 Analytics Platform!**

Follow this guide step by step, and you'll have your platform running on Netlify in minutes! 