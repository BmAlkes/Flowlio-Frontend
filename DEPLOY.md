# Frontend Deployment - Cloudflare Pages

## Quick Start

1. **Push code to GitHub**
2. **Connect to Cloudflare Pages**
3. **Set environment variables**
4. **Deploy**

## Environment Variables Required

Add these in Cloudflare Pages → Settings → Environment Variables:

```
VITE_BACKEND_DOMAIN=https://your-railway-backend.railway.app
VITE_BACKEND_URL=https://your-railway-backend.railway.app
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## Build Settings

- **Framework**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 18.x or higher

## After Deployment

1. Update backend `FRONTEND_URL` to match Cloudflare Pages URL
2. Test all API connections
3. Verify authentication works
