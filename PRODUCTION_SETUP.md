# TreeShop Production Deployment Guide

**Last Updated:** 2025-01-13

## Fixing Current Production Errors

### 1. Clerk Development Keys Warning
**Error:** `Clerk has been loaded with development keys`

**Fix:** Add production Clerk keys to Vercel environment variables:

1. Go to https://dashboard.clerk.com/
2. Create a **Production** instance (not Development)
3. Copy your production keys
4. Go to Vercel Project Settings → Environment Variables
5. Add these variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_xxxxxx
CLERK_SECRET_KEY = sk_live_xxxxxx
```

6. Redeploy the app

### 2. Manifest.json 404 Error
**Error:** `GET https://treeshopterminal.com/manifest.json 404`

**Fix:** This is now fixed! The code changes include:
- Created `/app/manifest.json/route.ts` to serve manifest as an API route
- Added explicit rewrite in `vercel.json`
- Next deployment will include the fix

### 3. afterSignInUrl Deprecation Warning
**Status:** Already fixed in code (using `fallbackRedirectUrl`)

The warning might persist from browser cache. Clear cache or wait for new deployment.

---

## Complete Production Environment Variables

Add these to Vercel → Settings → Environment Variables → Production:

### Clerk (Authentication)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Convex (Backend)

**Step 1: Deploy Convex to Production**
```bash
npx convex deploy --prod
```

This will create a production deployment and give you a URL like:
`https://your-prod-deployment.convex.cloud`

**Step 2: Configure Convex Environment Variables**

In your Convex dashboard (https://dashboard.convex.dev):
1. Go to your production deployment
2. Navigate to Settings → Environment Variables
3. Add this variable:

```
CLERK_JWT_ISSUER_DOMAIN=https://clerk.treeshopterminal.com
```

Or find your actual production domain at:
- Clerk Dashboard → Configure → API Keys → Advanced
- Copy the "Issuer URL" (should be your custom domain or clerk subdomain)

**Step 3: Add Convex URL to Vercel**

In Vercel environment variables, add:
```
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

---

## Deployment Checklist

- [ ] Clerk production keys added to Vercel
- [ ] Convex production deployment created
- [ ] Environment variables set in Vercel
- [ ] Domain configured (treeshopterminal.com)
- [ ] SSL certificate active
- [ ] PWA manifest serving correctly
- [ ] Service worker registered

---

## Testing Production Deployment

1. Visit https://treeshopterminal.com
2. Open DevTools Console (F12)
3. Check for errors:
   - ✅ No Clerk development key warnings
   - ✅ manifest.json loads (200 status)
   - ✅ No deprecation warnings

4. Test PWA functionality:
   - Add to Home Screen works
   - Offline mode works
   - App feels native on mobile

---

## Troubleshooting

### Still seeing 404 for manifest.json?
1. Check Vercel deployment logs
2. Verify `/app/manifest.json/route.ts` exists
3. Redeploy from main branch
4. Clear browser cache

### Clerk warnings persist?
1. Verify production keys start with `pk_live_` and `sk_live_`
2. Check Vercel environment variable scope is "Production"
3. Trigger new deployment (push to main)
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### PWA not installing?
1. Check manifest.json loads
2. Verify HTTPS is working
3. Check service worker registration in DevTools → Application tab
4. Look for PWA installability issues in DevTools console
