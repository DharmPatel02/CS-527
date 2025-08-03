# Netlify Environment Variables Setup

## Required Environment Variables

### 1. Backend API URL

**Variable Name:** `REACT_APP_API_URL`
**Value:** `https://vehicle-auction-system-backend.onrender.com`
**Purpose:** Points to your backend API hosted on Render
**Used in:** All API calls throughout the application

### 2. Supabase Project URL

**Variable Name:** `REACT_APP_SUPABASE_URL`
**Value:** `https://qulnppfcpveogwrmcixx.supabase.co`
**Purpose:** Your Supabase project URL for database operations
**Used in:** Database connections and queries

### 3. Supabase Anonymous Key

**Variable Name:** `REACT_APP_SUPABASE_ANON_KEY`
**Value:** `t1R0OJymadVIzTFYHImv2S0R5N5zNS9lw`
**Purpose:** Authentication key for Supabase client
**Used in:** Database authentication and API calls

## How to Set Environment Variables in Netlify

### Method 1: During Site Creation

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. In the build settings, scroll down to "Environment variables"
5. Add each variable one by one

### Method 2: In Existing Site Dashboard

1. Go to your Netlify dashboard
2. Click on your site name
3. Go to "Site settings" → "Environment variables"
4. Click "Add a variable"
5. Add each variable with the exact names and values above

### Method 3: Using netlify.toml (Alternative)

You can also add environment variables to your `netlify.toml` file:

```toml
[build.environment]
  REACT_APP_API_URL = "https://vehicle-auction-system-backend.onrender.com"
  REACT_APP_SUPABASE_URL = "https://qulnppfcpveogwrmcixx.supabase.co"
  REACT_APP_SUPABASE_ANON_KEY = "t1R0OJymadVIzTFYHImv2S0R5N5zNS9lw"
```

## Environment Variable Scopes

### Production Environment

- All variables are available in production builds
- Used when your site is live and accessible to users

### Deploy Preview Environment

- Same variables are used for preview deployments
- Used when testing changes before going live

### Branch Deploy Environment

- Variables are available for branch-specific deployments
- Used for testing different branches

## Verification Steps

### 1. Check Environment Variables are Set

1. Go to your Netlify dashboard
2. Site settings → Environment variables
3. Verify all three variables are listed

### 2. Test the Build

1. Trigger a new deployment
2. Check build logs for any environment variable errors
3. Verify the build completes successfully

### 3. Test the Application

1. Visit your deployed site
2. Open browser developer tools (F12)
3. Check console for any API connection errors
4. Test user registration/login functionality

## Troubleshooting

### Common Issues:

#### 1. "REACT_APP_API_URL is not defined"

- **Solution:** Check that the variable name is exactly `REACT_APP_API_URL`
- **Note:** React requires environment variables to start with `REACT_APP_`

#### 2. CORS Errors

- **Solution:** Ensure your backend CORS includes your Netlify URL
- **Check:** Backend environment variable `CORS_ORIGINS`

#### 3. Supabase Connection Errors

- **Solution:** Verify Supabase URL and key are correct
- **Check:** Supabase dashboard for correct credentials

#### 4. Build Failures

- **Solution:** Check Netlify build logs
- **Common cause:** Missing or incorrect environment variables

## Security Notes

- Environment variables in Netlify are encrypted
- Never commit sensitive keys to your repository
- Use different keys for development and production
- Regularly rotate your Supabase keys

## Testing Environment Variables

You can test if environment variables are working by adding this to your React app temporarily:

```javascript
console.log("API URL:", process.env.REACT_APP_API_URL);
console.log("Supabase URL:", process.env.REACT_APP_SUPABASE_URL);
```

Remove this code after testing!
