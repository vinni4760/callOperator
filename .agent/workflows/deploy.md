---
description: Deploy the Call Center Management System
---

# Deployment Workflow

This guide walks you through deploying the Call Center Management System to production using Render (backend) and Vercel (frontend).

## Prerequisites

Before you begin, ensure you have:

1. **GitHub Account** - Code must be pushed to GitHub
2. **Render Account** - Sign up at https://render.com
3. **Vercel Account** - Sign up at https://vercel.com
4. **MongoDB Atlas** - Database connection string ready
5. **Cloudinary Account** - API credentials ready

---

## Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/your-username/callcst.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `callcst` repository

### 2.2 Configure Service

- **Name**: `callcst-backend`
- **Region**: Choose closest to your users (e.g., Oregon)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 2.3 Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a strong random string (32+ characters) |
| `JWT_EXPIRE` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `FRONTEND_URL` | Leave blank for now (will update after frontend deployment) |

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Copy your backend URL (e.g., `https://callcst-backend.onrender.com`)

### 2.5 Test Backend

Visit `https://your-backend-url.onrender.com/api/health` - should return:
```json
{"success": true, "message": "Server is running"}
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the `callcst` repository

### 3.3 Configure Project

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3.4 Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` |

(Replace with your actual Render backend URL from Step 2.4)

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. Copy your frontend URL (e.g., `https://callcst.vercel.app`)

---

## Step 4: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to **"Environment"**
4. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://callcst.vercel.app`)
5. Service will automatically redeploy

---

## Step 5: Verify Deployment

### 5.1 Test Frontend
1. Visit your Vercel URL
2. Login page should load without errors
3. Check browser console for any issues

### 5.2 Test Registration & Login
1. Create a new account
2. Login with credentials
3. Verify JWT token is stored

### 5.3 Test User Features
1. View assigned calls (if any)
2. Submit feedback
3. Upload a call recording
4. Verify file appears in Cloudinary

### 5.4 Test Admin Features
1. Create first admin user (see below)
2. Create a call entry
3. View all calls
4. Create additional users

---

## Step 6: Create Admin User

Since the first user needs admin role, you have two options:

### Option A: Via MongoDB Atlas Dashboard
1. Go to MongoDB Atlas
2. Browse Collections → `users`
3. Find your user document
4. Edit `role` field to `"admin"`

### Option B: Via Database Tool
```bash
# Using MongoDB Compass or mongosh
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Troubleshooting

### Backend Issues

**Problem**: Server not starting
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

**Problem**: Database connection failed
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has correct permissions

### Frontend Issues

**Problem**: API calls failing
- Verify `VITE_API_URL` is set correctly in Vercel
- Check browser network tab for actual API URL being called
- Ensure backend CORS allows frontend URL

**Problem**: Routes not working (404 on refresh)
- Verify `vercel.json` is in frontend directory
- Check Vercel project settings for correct framework preset

### Cloudinary Issues

**Problem**: File upload failing
- Verify Cloudinary credentials in Render environment
- Check Render logs for Cloudinary errors
- Ensure Cloudinary upload preset allows unsigned uploads (if applicable)

---

## Post-Deployment Checklist

- [ ] Backend health check returns success
- [ ] Frontend loads without console errors
- [ ] User registration works
- [ ] User login works
- [ ] Admin can create calls
- [ ] Users can submit feedback
- [ ] File uploads work (Cloudinary)
- [ ] Database records are created correctly

---

## Automatic Deployments

Both Render and Vercel are configured for automatic deployments:

- **Render**: Automatically redeploys on push to `main` branch
- **Vercel**: Automatically rebuilds on push to `main` branch

To disable auto-deploy, adjust settings in respective dashboards.

---

## Monitoring

### Render Monitoring
- View logs: Dashboard → Your Service → Logs
- Check metrics: Dashboard → Your Service → Metrics

### Vercel Monitoring  
- View deployment logs: Dashboard → Your Project → Deployments
- Check analytics: Dashboard → Your Project → Analytics

---

## Next Steps

1. Set up custom domain (optional)
2. Configure email notifications (optional)
3. Add error monitoring (e.g., Sentry)
4. Set up automated backups for MongoDB
5. Configure rate limiting for API endpoints
