# Quick Start: Deploy to Vercel in 10 Minutes

## Prerequisites
- GitHub account with repository pushed
- Vercel account (free at https://vercel.com)
- MongoDB Atlas account (free at https://www.mongodb.com/cloud/atlas)

## Step 1: Generate Secrets (2 minutes)

Run this in your terminal to generate strong secrets:

```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Save these values — you'll need them in Step 3.

## Step 2: Set Up MongoDB Atlas (4 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create free cluster
3. Create database user:
   - Username: `taskmanager`
   - Password: (create strong password, save it)
4. Network Access → Allow from Anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` with your password and `myFirstDatabase` with `task-management`

Your final connection string will look like:
```
mongodb+srv://taskmanager:PASSWORD@cluster0.mongodb.net/task-management?retryWrites=true&w=majority
```

## Step 3: Deploy to Vercel (4 minutes)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. For "Root Directory" → leave as `./`
5. Click "Environment Variables" → Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB connection string from Step 2 |
| `JWT_SECRET` | Generated secret from Step 1 |
| `JWT_REFRESH_SECRET` | Generated refresh secret from Step 1 |
| `CORS_ALLOWED_ORIGINS` | Will update after deployment |
| `SOCKET_CORS_ORIGIN` | Will update after deployment |
| `JWT_EXPIRES_IN` | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `LOG_LEVEL` | `info` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |

6. Click "Deploy"
7. Wait for build to complete ✅

## Step 4: Update URLs (1 minute)

After deployment:

1. Vercel gives you a URL like `https://task-management-abc123.vercel.app`
2. In Vercel Settings → Environment Variables → Edit:
   - `CORS_ALLOWED_ORIGINS`: Your URL from above
   - `SOCKET_CORS_ORIGIN`: Your URL from above
3. Click "Save"
4. Go to Deployments → Click latest deploy → "Redeploy"
5. Wait for redeployment ✅

## Step 5: Test (2 minutes)

Visit these in your browser to verify:

```
Health check:
https://your-url/api/health

API documentation:
https://your-url/api-docs

Root endpoint:
https://your-url/
```

## Done! 🎉

Your API is now live on Vercel!

### API Endpoints
- **Base URL**: `https://your-project.vercel.app`
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **API Docs**: `/api-docs`
- **Health**: `/api/health`

### Test with cURL

```bash
# Register
curl -X POST https://your-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (use token from login)
curl https://your-url/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

**Build failed?**
- Check Vercel logs: Deployments → Failed deployment → Logs
- Ensure `package.json` has build script

**Connection refused?**
- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)

**Endpoints not working?**
- Verify environment variables set correctly
- Check CORS_ALLOWED_ORIGINS matches your Vercel URL
- Redeploy after env var changes

**For detailed guide**: See `VERCEL_DEPLOYMENT.md`
**For checklist**: See `DEPLOYMENT_CHECKLIST.md`
