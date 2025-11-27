# Vercel Deployment Checklist

## Pre-Deployment (Local)

- [ ] All changes committed and pushed to GitHub
- [ ] `.env` file NOT in repository (check `.gitignore`)
- [ ] `package.json` has correct build script: `"build": "tsc"`
- [ ] `package.json` has correct start script: `"start": "node dist/server.js"`
- [ ] `vercel.json` is properly configured
- [ ] Run `npm run build` locally to verify no build errors
- [ ] Run `npm test` to ensure tests pass
- [ ] All linting issues fixed: `npm run lint`

## MongoDB Setup

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created (username + strong password)
- [ ] IP whitelist includes 0.0.0.0/0 (or Vercel IPs)
- [ ] Connection string copied and verified

## Environment Variables Prepared

- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - 64-char random string (generated)
- [ ] `JWT_REFRESH_SECRET` - Different 64-char random string (generated)
- [ ] `CORS_ALLOWED_ORIGINS` - Your Vercel domain (after initial deploy, will know this)
- [ ] `SOCKET_CORS_ORIGIN` - Your Vercel domain
- [ ] Other vars from `.env.production` template

## Vercel Setup

- [ ] Vercel account created at https://vercel.com
- [ ] GitHub repository connected to Vercel
- [ ] Project created/imported in Vercel

## Deploy

- [ ] Go to https://vercel.com/new
- [ ] Import Git repository
- [ ] Configure project settings:
  - [ ] Framework: Node.js
  - [ ] Root Directory: ./
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Add all environment variables from `.env.production`
- [ ] Click "Deploy"
- [ ] Wait for build completion (should take 3-5 minutes)

## Post-Deployment Verification

- [ ] Deployment succeeded (no build errors)
- [ ] Note the deployment URL (e.g., `https://task-management.vercel.app`)
- [ ] Health check works: `curl https://your-url/api/health`
- [ ] Root endpoint works: `curl https://your-url/`
- [ ] API docs accessible: visit `https://your-url/api-docs`

## After Getting Vercel URL

- [ ] Update environment variables with Vercel URL:
  - `CORS_ALLOWED_ORIGINS`: `https://your-project.vercel.app`
  - `SOCKET_CORS_ORIGIN`: `https://your-project.vercel.app`
- [ ] Redeploy to apply new environment variables:
  - Go to Deployments → click Latest → "Redeploy"
- [ ] Wait for new deployment to complete
- [ ] Verify again with API calls

## Testing Endpoints

- [ ] Test Register: `POST /api/auth/register`
- [ ] Test Login: `POST /api/auth/login`
- [ ] Test Get Profile: `GET /api/auth/me` (with token)
- [ ] Test Create Team: `POST /api/teams` (with token)
- [ ] Test Create Project: `POST /api/projects` (with token)
- [ ] Test Create Task: `POST /api/tasks` (with token)
- [ ] Test Get Activities: `GET /api/activity/me` (with token)

## Monitoring

- [ ] Check Vercel Logs: Deployments → Logs
- [ ] Monitor MongoDB Atlas: Databases → Metrics
- [ ] Set up error tracking (optional): Sentry or similar

## Custom Domain (Optional)

- [ ] Purchase domain or prepare existing domain
- [ ] In Vercel: Settings → Domains → Add Domain
- [ ] Follow DNS configuration instructions
- [ ] Wait for SSL certificate (takes ~20-30 mins)
- [ ] Update `CORS_ALLOWED_ORIGINS` with custom domain
- [ ] Redeploy

## Troubleshooting Commands

If something goes wrong, test locally:

```bash
# Verify build works
npm run build

# Verify no linting errors
npm run lint

# Run tests
npm test

# Check environment variables needed
grep -r "process.env" src/ | grep -v node_modules

# Verify TypeScript compilation
npx tsc --noEmit
```

---

**Deployment Time**: ~10-15 minutes including setup
**Common Issues**: Database connection, env vars not set, build errors
**Support**: Check Vercel logs first, then MongoDB Atlas connection settings
