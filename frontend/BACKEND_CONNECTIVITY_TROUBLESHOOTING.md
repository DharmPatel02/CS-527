# Backend Connectivity Troubleshooting Guide

## Current Issue

Your website is deployed at [https://vehicle-auction-system.netlify.app/](https://vehicle-auction-system.netlify.app/) but login/signup is not working due to backend connectivity issues.

## Step-by-Step Troubleshooting

### 1. **Test Backend Connection**

1. **Visit your website**: [https://vehicle-auction-system.netlify.app/](https://vehicle-auction-system.netlify.app/)
2. **Click the "🔧 Test Backend Connection" button** (added to homepage)
3. **Open browser developer tools** (F12)
4. **Check the console** for test results

### 2. **Check Environment Variables in Netlify**

1. Go to [netlify.com](https://netlify.com) dashboard
2. Click on your site: `vehicle-auction-system`
3. Go to **Site settings** → **Environment variables**
4. **Verify these variables exist:**
   ```
   REACT_APP_API_URL = https://vehicle-auction-system-backend.onrender.com
   REACT_APP_SUPABASE_URL = https://qulnppfcpveogwrmcixx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = t1R0OJymadVIzTFYHImv2S0R5N5zNS9lw
   ```

### 3. **Update Backend CORS Configuration**

**This is the most likely cause of the issue.**

1. **Go to your Render dashboard**
2. **Find your backend service**
3. **Go to Environment variables**
4. **Add/Update this variable:**
   ```
   CORS_ORIGINS = https://vehicle-auction-system.netlify.app,https://vehicle-auction-system-frontend.vercel.app,http://localhost:3000
   ```
5. **Redeploy your backend:**
   - Click "Manual Deploy"
   - Select "Deploy latest commit"

### 4. **Test Backend Directly**

Test if your backend is running:

```bash
curl https://vehicle-auction-system-backend.onrender.com/health
```

Expected response: `OK` or similar

### 5. **Check Browser Console Errors**

1. **Open your website**
2. **Press F12** to open developer tools
3. **Go to Console tab**
4. **Try to login/signup**
5. **Look for these error types:**
   - CORS errors (Access-Control-Allow-Origin)
   - Network errors (Failed to fetch)
   - 404/500 errors

## Common Error Messages and Solutions

### **CORS Error:**

```
Access to fetch at 'https://vehicle-auction-system-backend.onrender.com/auth/login'
from origin 'https://vehicle-auction-system.netlify.app' has been blocked by CORS policy
```

**Solution:** Update backend CORS configuration (Step 3 above)

### **Network Error:**

```
Failed to fetch
```

**Solution:** Check if backend is running on Render

### **404 Error:**

```
GET https://vehicle-auction-system-backend.onrender.com/health 404
```

**Solution:** Backend endpoint doesn't exist or backend is not deployed

### **500 Error:**

```
Internal Server Error
```

**Solution:** Backend has an error, check Render logs

## Quick Fix Checklist

- [ ] **Environment variables set in Netlify**
- [ ] **Backend CORS updated with Netlify URL**
- [ ] **Backend redeployed on Render**
- [ ] **Backend health check passes**
- [ ] **No CORS errors in browser console**

## Manual Testing Steps

1. **Test Health Endpoint:**

   ```
   https://vehicle-auction-system-backend.onrender.com/health
   ```

2. **Test API Endpoint:**

   ```
   https://vehicle-auction-system-backend.onrender.com/auth/auction-items/summary
   ```

3. **Test with curl:**
   ```bash
   curl -H "Origin: https://vehicle-auction-system.netlify.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://vehicle-auction-system-backend.onrender.com/health
   ```

## If Still Not Working

1. **Check Render backend logs** for errors
2. **Verify Supabase connection** is working
3. **Test with a simple API call** from browser console
4. **Check if backend environment variables** are set correctly

## Contact Information

If you need help:

1. Check the test results from the button on your homepage
2. Share any error messages from browser console
3. Verify backend is running on Render
