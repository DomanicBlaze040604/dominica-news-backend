# 🚂 Deploy to Railway - Step by Step

## Method 1: Using Git (Recommended)

1. **Initialize Git (if not already done):**
```bash
git init
git add .
git commit -m "Updated backend with rate limiting fixes and sample data"
```

2. **Connect to Railway:**
```bash
# If you have Railway CLI
railway login
railway link

# Or connect via Railway dashboard
# Go to railway.app → Your project → Connect GitHub repo
```

3. **Deploy:**
```bash
git push origin main
# Railway will auto-deploy from GitHub
```

## Method 2: Using Railway CLI

```bash
railway login
railway up
```

## Method 3: Manual Upload

1. Go to https://railway.app
2. Find your project
3. Go to Settings → Connect GitHub
4. Push your code to GitHub
5. Railway will auto-deploy

## After Deployment

1. Wait 2-3 minutes for deployment
2. Check Railway logs for any errors
3. Test the API endpoints
4. Clear browser cache and refresh frontend