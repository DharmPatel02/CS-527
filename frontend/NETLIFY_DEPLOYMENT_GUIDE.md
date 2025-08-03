# Netlify Deployment Guide

## Prerequisites

- GitHub repository with your frontend code
- Netlify account (free tier available)
- Backend deployed on Render
- Database on Supabase

## Step 1: Deploy Backend to Render (if not already done)

1. **Update Render Environment Variables:**

   ```
   CORS_ORIGINS=https://vehicle-auction-system.netlify.app,https://vehicle-auction-system-frontend.vercel.app,http://localhost:3000
   ```

2. **Redeploy your backend** to apply CORS changes

## Step 2: Deploy Frontend to Netlify

### Option A: Using Netlify Dashboard (Recommended)

1. **Go to [netlify.com](https://netlify.com)** and sign in
2. **Click "New site from Git"**
3. **Choose GitHub** and authorize Netlify
4. **Select your repository**: `DharmPatel02/CS-527`
5. **Configure build settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. **Set environment variables:**
   ```
   REACT_APP_API_URL=https://vehicle-auction-system-backend.onrender.com
   REACT_APP_SUPABASE_URL=https://qulnppfcpveogwrmcixx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=t1R0OJymadVIzTFYHImv2S0R5N5zNS9lw
   ```
7. **Click "Deploy site"**

### Option B: Using Netlify CLI

1. **Install Netlify CLI:**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**

   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=build
   ```

## Step 3: Configure Custom Domain (Optional)

1. **In Netlify dashboard**, go to your site settings
2. **Click "Domain settings"**
3. **Add custom domain** if desired

## Step 4: Verify Deployment

1. **Check your Netlify URL** (e.g., `https://vehicle-auction-system.netlify.app`)
2. **Test all functionality:**
   - User registration/login
   - Auction browsing
   - Bidding functionality
   - Admin features

## Troubleshooting

### Build Errors

- Check Netlify build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### CORS Errors

- Ensure backend CORS includes your Netlify URL
- Check environment variables are set correctly
- Verify backend is running on Render

### API Connection Issues

- Check `REACT_APP_API_URL` environment variable
- Verify backend URL is correct
- Test API endpoints directly

## Environment Variables Reference

| Variable                      | Value                                                 | Description            |
| ----------------------------- | ----------------------------------------------------- | ---------------------- |
| `REACT_APP_API_URL`           | `https://vehicle-auction-system-backend.onrender.com` | Backend API URL        |
| `REACT_APP_SUPABASE_URL`      | `https://qulnppfcpveogwrmcixx.supabase.co`            | Supabase project URL   |
| `REACT_APP_SUPABASE_ANON_KEY` | `t1R0OJymadVIzTFYHImv2S0R5N5zNS9lw`                   | Supabase anonymous key |

## Support

If you encounter issues:

1. Check Netlify build logs
2. Verify environment variables
3. Test API connectivity
4. Check browser console for errors
