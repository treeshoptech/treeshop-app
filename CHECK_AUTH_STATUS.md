# Authentication Troubleshooting

## Current Error
`Not authenticated` when accessing Equipment page.

## Quick Checklist

### 1. Are you signed in?
- [ ] Visit http://localhost:3000/dashboard
- [ ] You should see your user avatar in the top-right
- [ ] If not, click "Get Started" and sign in

### 2. Do you have an organization?
- [ ] Look at the OrganizationSwitcher in the center of the top bar
- [ ] It should show your organization name (e.g., "TREE SHOP LLC")
- [ ] If it says "Personal account" or nothing, click it and **Create Organization**

### 3. Did you configure the JWT template in Clerk?
- [ ] Go to https://dashboard.clerk.com/
- [ ] Click **JWT Templates** in sidebar
- [ ] Should see a template named `convex`
- [ ] If not, create one (select "Convex" from dropdown)

### 4. Did you restart Convex after JWT setup?
After creating the JWT template, you MUST restart Convex:

```bash
# Kill Convex (find the PID)
ps aux | grep "convex dev"

# Kill it
kill -9 <PID>

# Restart in a new terminal
cd /Users/lockin/treeshop-app-clone
npx convex dev
```

### 5. Check browser console
Open browser DevTools (F12) and check:

```javascript
// Check if there's a Clerk session
localStorage.getItem('__clerk_db_jwt')
```

Should show a long JWT token. If `null`, you're not signed in.

## Still Not Working?

### Clear Everything and Start Fresh:

1. **Sign out completely**
   - Click user avatar → Sign out

2. **Clear browser data**
   - Clear cookies for localhost:3000
   - Clear local storage

3. **Restart dev servers**
   ```bash
   # Kill both servers
   killall node

   # Restart Next.js
   npm run dev

   # In another terminal, restart Convex
   npx convex dev
   ```

4. **Sign in again**
   - Visit http://localhost:3000
   - Click "Get Started"
   - Sign in with your account
   - Create or select an organization
   - Go to Equipment page

## Expected Flow

1. **Sign up** → Creates user in Clerk
2. **Create Organization** → Creates organization in Clerk
3. **JWT template** → Adds org info to token
4. **Convex receives token** → Extracts org_id from JWT
5. **Queries work** → Gets organization from Convex DB

## Debug Commands

Check if Convex is running:
```bash
ps aux | grep convex
```

Check environment variables:
```bash
cat .env.local | grep CLERK
cat .env.local | grep CONVEX
```

Test Convex connection:
```bash
npx convex dashboard
# Should open: https://dashboard.convex.dev/d/fine-ibis-640
```

## Common Issues

### "No organization context"
**Cause:** User doesn't have an organization
**Fix:** Create organization via OrganizationSwitcher

### "Not authenticated"
**Cause:** JWT template not configured or Convex not restarted
**Fix:** Create JWT template, restart Convex dev server

### "Organization not found in database"
**Cause:** Organization exists in Clerk but not synced to Convex
**Fix:** Will implement webhook sync later, for now organizations are created on-demand

---

After following these steps, the Equipment page should work!
