# Ship to Production Checklist

This document lists all configuration changes needed when deploying TreeShop to production.

---

## 1. Environment Variables

### Update `.env.local` → `.env.production`

**Clerk:**
```env
# Replace with production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Update redirect URLs to production domain
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://treeshop.app/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://treeshop.app/dashboard

# Update JWT issuer domain (get from Clerk Dashboard)
CLERK_JWT_ISSUER_DOMAIN=https://[your-prod-clerk-domain].clerk.accounts.dev
```

**Convex:**
```env
# Replace with production Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://[your-prod-deployment].convex.cloud
CONVEX_DEPLOYMENT=prod:[deployment-name]
```

---

## 2. Clerk Dashboard Configuration

### Switch to Production Instance

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. **Create a new Production instance** (or switch to production mode)
3. Copy production API keys

### Configure Production Paths

**Paths Settings:**
1. Go to **Paths** in left sidebar
2. Set **Home URL:** `https://treeshop.app`
3. Set **After sign in:** `https://treeshop.app/dashboard`
4. Set **After sign up:** `https://treeshop.app/dashboard`
5. Add **Allowed redirect URLs:**
   ```
   https://treeshop.app
   https://treeshop.app/*
   https://treeshop.app/dashboard
   ```

### Configure Organizations

1. Go to **Organizations** → **Settings**
2. Ensure **Organizations enabled**
3. Configure settings:
   - ✅ Enable personal accounts
   - ✅ Enable organization creation
   - ✅ Max organizations: Unlimited
4. Set **After leaving organization:** `https://treeshop.app`

### Configure JWT Template

1. Go to **JWT Templates**
2. Create template named `convex` (if not exists)
3. Select **Convex** as template type
4. Ensure claims include:
   ```json
   {
     "org_id": "{{org.id}}",
     "org_role": "{{org.role}}",
     "org_slug": "{{org.slug}}"
   }
   ```
5. Save

### Email & SMS Settings

1. Go to **Email & SMS**
2. Configure custom email domain (optional): `noreply@treeshop.app`
3. Review invitation email templates
4. Test email delivery

---

## 3. Convex Production Deployment

### Create Production Deployment

```bash
# Deploy to production
npx convex deploy

# Follow prompts to create production deployment
```

### Set Production Environment Variables

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your **production** deployment
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
CLERK_JWT_ISSUER_DOMAIN=https://[your-prod-clerk-domain].clerk.accounts.dev
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## 4. Next.js Production Build

### Vercel Deployment (Recommended)

1. **Connect GitHub repo to Vercel**
2. **Configure environment variables** in Vercel dashboard:
   - All variables from `.env.production`
3. **Set build settings:**
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
4. **Deploy**

### Custom Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 5. Domain Configuration

### DNS Settings

Point `treeshop.app` to your hosting:

**For Vercel:**
1. Add custom domain in Vercel dashboard
2. Update DNS records:
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```

**SSL Certificate:**
- Vercel handles automatically
- For custom hosting: Use Let's Encrypt or Cloudflare

---

## 6. Post-Deployment Configuration

### Clerk Production Settings

1. **Remove development URLs** from allowed redirects:
   - Delete `http://localhost:3000` entries
   - Only keep `https://treeshop.app` URLs

2. **Configure webhooks** for organization sync:
   - Webhook URL: `https://treeshop.app/api/webhooks/clerk`
   - Subscribe to events:
     - `organization.created`
     - `organization.updated`
     - `organization.deleted`
   - Copy webhook secret
   - Add to environment: `CLERK_WEBHOOK_SECRET=whsec_...`

### Security Checklist

- [ ] All API keys are production keys (not test keys)
- [ ] Environment variables secured in hosting platform
- [ ] Development URLs removed from Clerk allowed redirects
- [ ] HTTPS enforced on all routes
- [ ] CORS configured correctly (if using API routes)
- [ ] Rate limiting enabled (Clerk handles auth rate limiting)

---

## 7. Testing Production

### Test Authentication Flow

1. Visit `https://treeshop.app`
2. Sign up with new account
3. Create organization
4. Verify redirect to `/dashboard`
5. Invite team member
6. Test invitation acceptance
7. Test organization switching
8. Visit `/dashboard/team` page

### Test Multi-Tenancy

1. Create two organizations
2. Add data to each organization
3. Switch between organizations
4. Verify data isolation (each org only sees their data)

### Monitor Logs

**Vercel:**
- Check deployment logs
- Monitor function logs
- Check edge function logs

**Convex:**
- Monitor function logs in dashboard
- Check for auth errors
- Verify organization queries working

---

## 8. Analytics & Monitoring (Optional - Future)

### Set up monitoring:

- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel Analytics or Google Analytics)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Vercel Speed Insights)

---

## 9. Backup & Recovery

### Database Backups

**Convex:**
- Automatic backups included
- Export data via Convex dashboard if needed

**Clerk:**
- User data backed up automatically
- Export users via Clerk dashboard if needed

---

## 10. Pre-Launch Checklist

- [ ] All environment variables updated to production values
- [ ] Clerk production instance configured
- [ ] Convex production deployment created
- [ ] Production domain configured and SSL working
- [ ] Test authentication flow end-to-end
- [ ] Test multi-tenant data isolation
- [ ] Remove all development URLs from Clerk settings
- [ ] Configure Clerk webhooks for org sync
- [ ] Test invitation emails sending correctly
- [ ] Test all user roles (Owner, Admin, Member)
- [ ] Verify `/dashboard/team` management working
- [ ] Check mobile responsiveness
- [ ] Test organization switching
- [ ] Monitor logs for errors
- [ ] Document any custom configuration

---

## Quick Reference: What Changes?

| Item | Development | Production |
|------|-------------|------------|
| Domain | `http://localhost:3000` | `https://treeshop.app` |
| Clerk Keys | `pk_test_...` / `sk_test_...` | `pk_live_...` / `sk_live_...` |
| Clerk Domain | `frank-mammal-96.clerk.accounts.dev` | `[prod-instance].clerk.accounts.dev` |
| Convex URL | `https://fine-ibis-640.convex.cloud` | `https://[prod-deployment].convex.cloud` |
| Convex Deployment | `dev:fine-ibis-640` | `prod:[deployment-name]` |
| Allowed Redirects | Includes localhost URLs | Only production URLs |

---

## Support Resources

- [Clerk Production Checklist](https://clerk.com/docs/deployments/overview)
- [Convex Production Deployment](https://docs.convex.dev/production/hosting)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** 2025-11-11
**Ready for Production:** After completing all checklist items above
