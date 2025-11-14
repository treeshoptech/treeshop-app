# Production Deployment Steps

## Step 1: Deploy Convex to Production

```bash
npx convex deploy --prod
```

When prompted, it will give you a production deployment URL.
**Copy this URL** - you'll need it for Vercel.

Example output:
```
✓ Deployed functions to production deployment.
  https://your-deployment-123.convex.cloud
```

## Step 2: Configure Convex Environment Variables

1. Go to https://dashboard.convex.dev
2. Select your **production** deployment (the one you just created)
3. Click **Settings** → **Environment Variables**
4. Add this variable:

```
CLERK_JWT_ISSUER_DOMAIN=https://clerk.treeshopterminal.com
```

Click **Save**

## Step 3: Add Environment Variables to Vercel

Go to: https://vercel.com/your-username/treeshop-app/settings/environment-variables

Add these 3 variables (set Environment to **Production** only):

### Variable 1: Clerk Publishable Key
```
Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_live_XXXXX (use the key you have)
Environment: ✅ Production
```

### Variable 2: Clerk Secret Key
```
Name: CLERK_SECRET_KEY
Value: sk_live_XXXXX (use the key you have)
Environment: ✅ Production
```

### Variable 3: Convex Production URL
```
Name: NEXT_PUBLIC_CONVEX_URL
Value: https://your-deployment-123.convex.cloud
       ^^^^^^ USE THE URL FROM STEP 1 ^^^^^^
Environment: ✅ Production
```

## Step 4: Redeploy Vercel

**Option A - Trigger from GitHub:**
```bash
git commit --allow-empty -m "Trigger production deployment"
git push
```

**Option B - From Vercel Dashboard:**
1. Go to Deployments tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

## Step 5: Verify Everything Works

After deployment completes (2-3 minutes):

1. Visit https://www.treeshopterminal.com
2. Open DevTools Console (F12)
3. You should see **NO ERRORS**:
   - ✅ No Clerk development key warnings
   - ✅ No manifest.json 404
   - ✅ No Convex auth errors
   - ✅ No favicon.ico 404

## Troubleshooting

If you still see "No auth provider found":
1. Double-check `CLERK_JWT_ISSUER_DOMAIN` in Convex dashboard
2. Make sure it's exactly: `https://clerk.treeshopterminal.com`
3. No trailing slash!
4. Redeploy Convex functions: `npx convex deploy --prod`

If manifest.json still 404:
1. Check the latest deployment includes the `/api/manifest` route
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Try https://www.treeshopterminal.com/api/manifest directly

If Clerk warnings persist:
1. Verify production keys in Vercel start with `pk_live_` and `sk_live_`
2. Check they're set to **Production** environment (not Preview/Development)
3. Hard refresh browser after deployment

---

## Current Deployment Status

- [x] Code fixes pushed to GitHub
- [x] Convex deployed to production ✅
  - URL: https://bright-quail-848.convex.cloud
- [x] Convex environment variables set ✅
  - CLERK_JWT_ISSUER_DOMAIN=https://clerk.treeshopterminal.com
- [ ] Vercel environment variables added (SEE VERCEL_ENV_VARS.txt)
- [ ] Production deployment triggered
- [ ] All errors resolved

Complete each step above to finish production setup!
