# Fix Convex Authentication Error

## Problem
Getting "Not authenticated" error when accessing Convex queries from the Equipment page.

## Root Cause
Clerk JWT template is not configured for Convex, so authentication tokens aren't being passed to Convex.

## Solution - Configure Clerk JWT Template

### Step 1: Create Convex JWT Template

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your TreeShop application
3. In the left sidebar, click **JWT Templates**
4. Click **New template**
5. Select **Convex** from the list of applications
6. Name it: `convex`
7. The template should auto-populate with these claims:
   ```json
   {
     "sub": "{{user.id}}",
     "aud": "convex",
     "iss": "{{iss}}",
     "iat": {{iat}},
     "exp": {{exp}},
     "org_id": "{{org.id}}",
     "org_role": "{{org.role}}",
     "org_slug": "{{org.slug}}"
   }
   ```
8. Click **Apply Changes** or **Save**

### Step 2: Verify Convex Environment Variable

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your project: `fine-ibis-640`
3. Go to **Settings** → **Environment Variables**
4. Verify these variables exist:
   - `CLERK_JWT_ISSUER_DOMAIN` = `https://frank-mammal-96.clerk.accounts.dev`
   - If missing, add it and save

### Step 3: Restart Development Servers

After configuring the JWT template:

```bash
# Kill and restart Convex dev
# Terminal 1
npx convex dev

# Kill and restart Next.js (if needed)
# Terminal 2
npm run dev
```

### Step 4: Test Authentication

1. Visit http://localhost:3000/dashboard
2. Make sure you're signed in and have an organization selected
3. Click on Equipment in the bottom navigation
4. You should see the equipment list (empty at first)
5. Click the + button to add equipment

## Alternative: Check If User Is In Organization

If the JWT template is correct but you're still getting errors, make sure:

1. You've created an organization in Clerk
2. You're currently in an organization (check the OrganizationSwitcher)
3. The organization ID is showing in the switcher

To create an organization:
1. Click the OrganizationSwitcher in the top nav
2. Click **Create Organization**
3. Enter your company name
4. Click **Create**

## Debugging

If issues persist, check the browser console for JWT token info:

```javascript
// In browser console
localStorage.getItem('__clerk_db_jwt')
```

This should show a JWT token if authentication is working.

## Common Issues

### Issue: "No organization context"
**Solution:** User must be in an organization. Create one via OrganizationSwitcher.

### Issue: JWT template not found
**Solution:** Make sure you selected "Convex" as the template type, not "Blank".

### Issue: Still getting "Not authenticated"
**Solution:**
1. Clear browser cache and cookies
2. Sign out and sign back in
3. Verify JWT template is applied (may take a few minutes)

---

**After completing these steps, the Equipment page should work!**
