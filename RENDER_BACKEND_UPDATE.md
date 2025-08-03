# Render Backend Update Guide for Netlify

## Required Changes for Netlify Deployment

### 1. Update Environment Variables in Render

Go to your Render dashboard and update the environment variables for your backend service:

**Add/Update this environment variable:**

```
CORS_ORIGINS=https://vehicle-auction-system.netlify.app,https://vehicle-auction-system-frontend.vercel.app,http://localhost:3000
```

### 2. Redeploy Backend

After updating the environment variables:

1. Go to your Render dashboard
2. Find your backend service
3. Click "Manual Deploy" → "Deploy latest commit"

### 3. Verify Backend is Working

Test your backend endpoints:

```bash
curl https://vehicle-auction-system-backend.onrender.com/health
```

### 4. Check CORS Headers

Your backend should now accept requests from:

- `https://vehicle-auction-system.netlify.app` (your Netlify frontend)
- `https://vehicle-auction-system-frontend.vercel.app` (your Vercel frontend - backup)
- `http://localhost:3000` (local development)

## No Changes Needed for Supabase

Your Supabase database configuration remains the same. The frontend will continue to use the same Supabase credentials.

## Testing the Connection

After deploying to Netlify, test these endpoints:

1. **Health Check**: `GET /health`
2. **User Registration**: `POST /auth/signup`
3. **User Login**: `POST /auth/login`
4. **Auction Items**: `GET /auth/auction-items/summary`

## Troubleshooting

If you encounter CORS errors:

1. Verify the `CORS_ORIGINS` environment variable is set correctly
2. Check that your backend has been redeployed
3. Ensure the Netlify URL is included in the CORS origins list
4. Test with a simple curl request to verify CORS headers
