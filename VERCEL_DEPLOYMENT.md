# Vercel Deployment Guide

This guide walks you through deploying the Real-Time Team Task Management System to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub account with the repository pushed
- MongoDB Atlas account (or MongoDB on a server accessible from Vercel)
- Vercel CLI installed (optional but recommended)

## Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

2. Verify your `.gitignore` includes:
```
node_modules/
dist/
.env
.env.local
.env.*.local
coverage/
```

## Step 2: Set Up MongoDB Atlas (for production database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in or create account
3. Create a new project:
   - Click "Create" → "New Project"
   - Name: "TaskManagement"
4. Create a cluster:
   - Click "Create" → "Shared" (free tier)
   - Provider: AWS, Region: closest to you
   - Click "Create Cluster"
5. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `taskmanager` (or your choice)
   - Password: Generate a strong password, copy it
   - Click "Add User"
6. Add IP whitelist:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
7. Get connection string:
   - Go to "Databases" → "Connect"
   - Choose "Drivers"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `task-management`
   
   Example:
   ```
   mongodb+srv://taskmanager:YOUR_PASSWORD@cluster0.mongodb.net/task-management?retryWrites=true&w=majority
   ```

## Step 3: Deploy to Vercel via Web UI (Easiest)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Project Name**: `task-management-system` (or your choice)
   - **Framework Preset**: Node.js
   - **Root Directory**: ./
   - Click "Continue"
5. Add environment variables (click "Add New" for each):
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `MONGODB_URI`: paste MongoDB Atlas connection string
   - `JWT_SECRET`: generate strong secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - `JWT_REFRESH_SECRET`: generate another strong secret
   - `CORS_ALLOWED_ORIGINS`: `https://your-vercel-url.vercel.app`
   - `SOCKET_CORS_ORIGIN`: `https://your-vercel-url.vercel.app`
   - `JWT_EXPIRES_IN`: `24h`
   - `JWT_REFRESH_EXPIRES_IN`: `7d`
   - `LOG_LEVEL`: `info`
   - `RATE_LIMIT_WINDOW_MS`: `900000`
   - `RATE_LIMIT_MAX_REQUESTS`: `100`
6. Click "Deploy"
7. Wait for build to complete (takes ~3-5 minutes)
8. Once deployed, note your URL: `https://your-project.vercel.app`

## Step 4: Update Environment Variables with Final URL

After deployment:

1. Go to your Vercel project → Settings → Environment Variables
2. Update:
   - `CORS_ALLOWED_ORIGINS`: `https://your-project.vercel.app`
   - `SOCKET_CORS_ORIGIN`: `https://your-project.vercel.app`
3. Click "Save"
4. Go to Deployments → Redeploy latest commit to apply new vars

## Step 5: Verify Deployment

Test your deployed API:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# API root
curl https://your-project.vercel.app/

# API documentation
# Visit https://your-project.vercel.app/api-docs in browser
```

## Step 6: Alternative - Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to configure environment variables
```

## Step 7: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Enter your custom domain
3. Follow DNS configuration steps provided

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'src'`
- Ensure `vercel.json` is configured correctly
- Verify `package.json` build script: `"build": "tsc"`

**Error**: `NODE_VERSION not specified`
- Add to `vercel.json`:
  ```json
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
  ```

### Database Connection Issues

**Error**: `MongoDB connection failed`
- Verify MongoDB Atlas connection string is correct
- Check IP whitelist (should be 0.0.0.0/0)
- Ensure credentials are URL-encoded (special chars encoded)

### CORS Errors

- Update `CORS_ALLOWED_ORIGINS` to your Vercel URL
- Redeploy after changing environment variables

### Socket.IO Issues

- Update `SOCKET_CORS_ORIGIN` to your Vercel URL
- Ensure frontend makes requests to same domain

## Environment Variables Reference

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Vercel assigns port |
| `MONGODB_URI` | MongoDB Atlas URL | Use connection string |
| `JWT_SECRET` | 64-char random string | Generate with crypto |
| `JWT_REFRESH_SECRET` | 64-char random string | Different from JWT_SECRET |
| `JWT_EXPIRES_IN` | `24h` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `CORS_ALLOWED_ORIGINS` | Vercel URL | Allow frontend requests |
| `SOCKET_CORS_ORIGIN` | Vercel URL | Allow WebSocket connections |
| `LOG_LEVEL` | `info` or `debug` | Logging verbosity |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Requests per window |

## Post-Deployment

1. **Monitor Logs**: Vercel dashboard → Deployments → Logs
2. **Set Up Monitoring**: 
   - Use Vercel Analytics
   - Configure error tracking with Sentry (optional)
3. **Backup Database**: Set up automatic backups in MongoDB Atlas
4. **Update Swagger Docs**: Edit `src/docs/swagger.ts` to include production URL

## Rolling Back

If deployment has issues:

1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Redeploy"

## Next Steps

- Set up CI/CD with GitHub Actions
- Add email notifications (nodemailer)
- Implement API rate limiting per user
- Add request logging/monitoring
- Set up error tracking (Sentry)
- Configure custom domain with SSL
