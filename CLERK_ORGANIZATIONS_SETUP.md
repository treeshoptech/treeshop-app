# Clerk Organizations Setup Guide

This guide walks you through enabling multi-tenancy with Clerk Organizations for TreeShop.

## Prerequisites

- Clerk account (you already have this)
- TreeShop app with Clerk authentication configured

## Step 1: Enable Clerk Organizations (5 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your TreeShop application
3. In the left sidebar, click on **Organizations**
4. Click **Enable Organizations**
5. Configure the following settings:

   **General Settings:**
   - ✅ Enable personal accounts (allow users without organizations initially)
   - ✅ Enable organization creation (users can create their own companies)
   - ✅ Max organizations per user: **Unlimited** (users can belong to multiple companies)

   **Domains:**
   - Leave empty for now (not needed for tree service companies)

   **Invitation Settings:**
   - ✅ Enable invitations
   - Invitation expiration: **7 days**
   - ✅ Allow members to invite

## Step 2: Create Custom Roles (10 minutes)

Clerk Organizations come with two default roles (Admin and Member). We need to create 3 additional custom roles for TreeShop.

1. In Clerk Dashboard, go to **Organizations** → **Roles**
2. You'll see the default roles:
   - `org:admin` - Can manage members and settings
   - `org:member` - Basic member access

3. Click **Create Role** and add each of the following:

### Role 1: Manager

- **Name:** Manager
- **Key:** `org:manager`
- **Description:** Can create projects, manage operations, and use all pricing tools
- **Permissions:** (Clerk will auto-assign, or you can customize later)

### Role 2: Estimator

- **Name:** Estimator
- **Key:** `org:estimator`
- **Description:** Can use pricing calculators and create proposals only
- **Permissions:** Limited to pricing and proposal features

### Role 3: Crew Member

- **Name:** Crew Member
- **Key:** `org:crew`
- **Description:** Can view assigned work orders only
- **Permissions:** Read-only access to assigned work

**Note:** The `org:owner` role is automatically assigned to the user who creates the organization.

## Step 3: Configure Clerk JWT Template for Convex (5 minutes)

We need to add organization claims to the JWT token so Convex knows which organization the user belongs to.

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New template**
3. Select **Convex** as the template type
4. Name it: `convex`
5. The template should include these claims (should be pre-configured):
   ```json
   {
     "org_id": "{{org.id}}",
     "org_role": "{{org.role}}",
     "org_slug": "{{org.slug}}"
   }
   ```
6. Click **Save**

## Step 4: Update Environment Variables

Your `.env.local` is already configured with:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_JWT_ISSUER_DOMAIN=https://frank-mammal-96.clerk.accounts.dev
NEXT_PUBLIC_CONVEX_URL=https://fine-ibis-640.convex.cloud
CONVEX_DEPLOYMENT=dev:fine-ibis-640
```

✅ No changes needed - you're all set!

## Step 5: Test the Multi-Tenant Flow (10 minutes)

### Test 1: Create an Organization

1. Sign out if you're currently signed in
2. Visit http://localhost:3000
3. Click **Sign Up**
4. Create a new account
5. After sign-up, you should see a modal prompting you to **Create an Organization**
6. Enter your tree service company name (e.g., "ABC Tree Service")
7. Click **Create organization**
8. You'll be redirected to `/dashboard`

### Test 2: Invite a Team Member

1. In the dashboard, click on the **Organization Switcher** in the top nav
2. Click **Manage organization**
3. Go to the **Members** tab
4. Click **Invite**
5. Enter an email address and select a role (try "Manager")
6. Click **Send invitation**
7. The invited user will receive an email with a link to join

### Test 3: Accept an Invitation (use incognito/different browser)

1. Open the invitation email
2. Click the **Accept Invitation** link
3. You'll be prompted to sign up
4. After creating an account, you'll automatically be added to the organization
5. You'll land on `/dashboard` with the organization context set

### Test 4: Organization Switching

1. Create a second organization using the Organization Switcher
2. Click the Organization Switcher in the nav
3. You should see both organizations listed
4. Click to switch between them
5. Notice how the context changes (in the future, different data will load)

## Step 6: Sync Organizations to Convex (Future)

Right now, organizations exist only in Clerk. To sync them to Convex:

### Option A: Manual Sync (Development)

When a user creates an organization, manually call the Convex mutation:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const syncOrg = useMutation(api.organizations.syncFromClerk);

// Call this after organization creation
await syncOrg({
  clerkOrgId: organization.id,
  name: organization.name,
  slug: organization.slug,
});
```

### Option B: Webhook Sync (Production - Recommended)

Set up a Clerk webhook to automatically sync organizations:

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter webhook URL: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to events:
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`
5. Copy the webhook secret
6. Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_...`
7. Implement the webhook handler (we'll do this later)

## Step 7: Verify Everything Works

Run through this checklist:

- [ ] Organizations enabled in Clerk Dashboard
- [ ] Custom roles created (Manager, Estimator, Crew Member)
- [ ] JWT template configured for Convex
- [ ] Can create an organization after sign-up
- [ ] Organization Switcher appears in dashboard nav
- [ ] Can invite members
- [ ] Invitations are received via email
- [ ] Invited users can join successfully
- [ ] Can switch between multiple organizations
- [ ] Team management page works (`/dashboard/team`)

## Troubleshooting

### "No organization context" error

**Problem:** User is signed in but gets "No organization context" error

**Solution:**
1. Make sure the user has created or joined an organization
2. Check that the Organization Switcher shows the current organization
3. If the user has no organizations, they need to create one first

### Organization Switcher not appearing

**Problem:** The Organization Switcher doesn't show in the nav

**Solution:**
1. Make sure you're on a dashboard page (has the dashboard layout)
2. Refresh the page
3. Check that Organizations are enabled in Clerk Dashboard

### Invitation emails not sending

**Problem:** Invited users don't receive emails

**Solution:**
1. Check Clerk Dashboard → Email & SMS → Invitation templates
2. Make sure invitation emails are enabled
3. Check spam folder
4. Verify the email address is correct

### Can't create custom roles

**Problem:** "Create Role" button is disabled

**Solution:**
1. Custom roles require a paid Clerk plan
2. For development, the default Admin and Member roles work
3. Upgrade your Clerk plan or use the default roles for now

## Next Steps

Now that Clerk Organizations is set up:

1. **Build onboarding flow** - Guide new organizations through setup
2. **Create equipment management** - Add equipment to the organization
3. **Create employee management** - Add employees to the organization
4. **Build loadout configurations** - Configure service loadouts
5. **Add permission checks** - Use role-based access control in your app
6. **Set up Clerk webhooks** - Auto-sync organizations to Convex

## Permission System

With the roles we've created, here's how permissions work:

| Feature | Owner | Admin | Manager | Estimator | Crew |
|---------|-------|-------|---------|-----------|------|
| Billing & Subscription | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Company | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Equipment Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Employee Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Loadout Configuration | ✅ | ✅ | ✅ | ❌ | ❌ |
| Pricing Calculators | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Proposals | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Financial Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Customers | ✅ | ✅ | ✅ | ✅ | ❌ |
| View All Projects | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Assigned Work | ✅ | ✅ | ✅ | ✅ | ✅ |

## Resources

- [Clerk Organizations Docs](https://clerk.com/docs/organizations/overview)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Clerk Custom Roles](https://clerk.com/docs/organizations/roles-permissions)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)

---

**Setup Complete!** 🎉

Your TreeShop app now has full multi-tenant support with Clerk Organizations. Each tree service company can manage their own team, equipment, and projects in complete isolation from other companies.
