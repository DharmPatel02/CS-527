# Auction System Deployment Guide

## Prerequisites

1. GitHub account with your project pushed to a repository
2. Supabase account (for PostgreSQL database)
3. Render account (for backend deployment)

## Step 1: Fix Critical Issues

### 1.1 Fix pom.xml Syntax Error

**IMPORTANT**: Before deploying, manually edit your `backend/pom.xml` file:

- **Line 18** currently has: `<n>auction-system</n>`
- **Change it to**: `<name>auction-system</name>`

This is a critical XML syntax error that will prevent your build from succeeding.

## Step 2: Database Setup (Supabase)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Choose a region close to your users
5. Set a strong database password

### 2.2 Get Database Connection Details

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Note down the following details:
   - **Host**: `db.xxx.supabase.co`
   - **Database name**: `postgres`
   - **Username**: `postgres`
   - **Password**: (the one you set during project creation)
   - **Port**: `5432`

### 2.3 Create Connection URL

Format your database URL as:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

Example:

```
postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 2.4 Run Your Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. **IMPORTANT**: Use the `supabase_schema.sql` file (PostgreSQL version) instead of `auctionsystem.sql` (MySQL version)
3. Copy and paste the entire content of `supabase_schema.sql` into the SQL Editor
4. Click "Run" to create all tables, indexes, and constraints

### 2.5 Database Migration Notes

**Why do you need a different SQL file?**

Your original `auctionsystem.sql` file is written in **MySQL syntax**, but Supabase uses **PostgreSQL**. Here are the key differences I've converted for you:

| MySQL Syntax          | PostgreSQL Syntax               | Used For              |
| --------------------- | ------------------------------- | --------------------- |
| `AUTO_INCREMENT`      | `SERIAL` or `BIGSERIAL`         | Auto-incrementing IDs |
| `ENGINE=InnoDB`       | Not needed                      | Storage engine        |
| `CHARSET=utf8mb4`     | Not needed                      | Character encoding    |
| `BIT(1)`              | `BOOLEAN`                       | Boolean fields        |
| `LONGBLOB`            | `BYTEA`                         | Binary data (images)  |
| `ENUM('val1','val2')` | `CREATE TYPE name AS ENUM(...)` | Enumerated types      |

**New features added in PostgreSQL version:**

- Better indexes for performance
- Data integrity constraints
- Automatic `created_at` and `updated_at` timestamps
- Database triggers for automatic updates

## Step 3: Backend Deployment (Render)

### 3.1 Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Make sure the pom.xml fix from Step 1.1 is applied and committed

### 3.2 Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub account and select your repository
4. Configure the service:

#### Basic Settings:

- **Name**: `auction-system-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `CS--527/backend`
- **Runtime**: `Docker`

#### Build Settings:

- **Build Command**: (Leave empty - Docker will handle this)
- **Start Command**: (Leave empty - Docker will handle this)

### 3.3 Environment Variables

In Render, add these environment variables:

| Key            | Value                                                                        | Description                                          |
| -------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| `DB_URL`       | `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres` | Your Supabase connection URL                         |
| `DB_USERNAME`  | `postgres`                                                                   | Database username                                    |
| `DB_PASSWORD`  | `your-supabase-password`                                                     | Your Supabase database password                      |
| `CORS_ORIGINS` | `https://your-frontend-domain.com,http://localhost:3000`                     | Allowed CORS origins (update with your frontend URL) |

### 3.4 Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any errors

## Step 4: Frontend Configuration

### 4.1 Update Frontend API URL

Once your backend is deployed, update your frontend to use the Render URL:

1. In your React app, find where you're making API calls
2. Replace `http://localhost:8080` with your Render URL: `https://your-service-name.onrender.com`

### 4.2 Update CORS Origins

Update the `CORS_ORIGINS` environment variable in Render with your frontend's domain.

## Step 5: Testing

### 5.1 Test Backend

1. Visit your Render URL: `https://your-service-name.onrender.com`
2. Test API endpoints manually or using Postman

### 5.2 Test Database Connection

Check the Render logs to ensure the database connection is successful.

## Common Deployment Issues & Solutions

### Issue 1: Build Fails

- **Cause**: pom.xml syntax error
- **Solution**: Fix the `<n>` tag as described in Step 1.1

### Issue 2: Database Connection Fails

- **Causes**:
  - Incorrect connection string
  - Wrong database credentials
  - Supabase project not accessible
- **Solutions**:
  - Double-check the connection URL format
  - Verify credentials in Supabase dashboard
  - Ensure Supabase project is in "Active" status

### Issue 3: CORS Errors

- **Cause**: Frontend domain not in allowed origins
- **Solution**: Update `CORS_ORIGINS` environment variable in Render

### Issue 4: App Crashes on Startup

- **Cause**: Missing environment variables
- **Solution**: Verify all required environment variables are set in Render

### Issue 5: SSL/TLS Errors

- **Cause**: Database SSL requirements
- **Solution**: Ensure your connection URL includes SSL parameters (already configured in application.properties)

## Environment Variables Summary

For quick reference, here are all the environment variables you need to set in Render:

```bash
DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

## Health Check

Your application will be available at: `https://your-service-name.onrender.com`

To verify it's working:

1. Check the Render logs for startup messages
2. Visit the URL to see if it responds
3. Test a simple API endpoint

## Troubleshooting

If you encounter issues:

1. Check Render build logs for errors
2. Check Render runtime logs for connection issues
3. Verify environment variables are correctly set
4. Test database connection from Supabase SQL editor
5. Ensure your GitHub repository has the latest code with the pom.xml fix
