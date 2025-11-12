# Next.js + Clerk + Convex Multi-Tenant Boilerplate

This is a production-ready multi-tenant authentication boilerplate with:
- **Next.js 16.0.1** (App Router, TypeScript, Turbopack)
- **Clerk Organizations** (Multi-tenant auth with Owner/Admin/Member roles)
- **Convex** (Real-time database with organization-based isolation)
- **Material-UI v7** (Apple-inspired dark theme)

## Features

✅ **Complete Multi-Tenant Architecture**
- Organization-based data isolation
- Role-based permissions (Owner, Admin, Member)
- Team management UI
- Organization switching

✅ **Authentication**
- Pre-built Clerk components (no custom auth needed)
- JWT tokens with organization context
- Automatic redirects after sign-in/sign-up
- Invitation system for team members

✅ **Database Schema**
- 7 multi-tenant tables ready to use
- Organization, Equipment, Employees, Loadouts, Customers, Projects, Proposals
- SwiftData-style indexes for performance
- Permission helpers for queries and mutations

✅ **UI/UX**
- Apple-inspired dark theme (#000000 background, #007AFF primary)
- Responsive Material-UI components
- Dashboard with KPI cards
- Team management page
- Organization switcher in navigation

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/treeshoptech/treeshop-app.git my-saas-app
cd my-saas-app
npm install
```

### 2. Set Up Clerk

1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Enable Organizations
4. Copy API keys

### 3. Set Up Convex

```bash
npx convex dev --configure=new
```

Follow prompts to create new project.

### 4. Configure Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_JWT_ISSUER_DOMAIN=https://[your-clerk-domain].clerk.accounts.dev

# Convex
NEXT_PUBLIC_CONVEX_URL=https://[your-deployment].convex.cloud
CONVEX_DEPLOYMENT=dev:[deployment-name]
```

### 5. Configure Clerk Dashboard

**Paths:**
- Home URL: `http://localhost:3000`
- After sign in: `http://localhost:3000/dashboard`
- After sign up: `http://localhost:3000/dashboard`
- Allowed redirects: `http://localhost:3000/*`

**JWT Template:**
- Create template named `convex`
- Select "Convex" as type
- Save

### 6. Configure Convex Dashboard

Add environment variable:
- Name: `CLERK_JWT_ISSUER_DOMAIN`
- Value: `https://[your-clerk-domain].clerk.accounts.dev`

### 7. Run Development Servers

```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Convex
npx convex dev
```

Visit http://localhost:3000

## Project Structure

```
├── app/
│   ├── dashboard/          # Protected dashboard
│   │   ├── layout.tsx     # Layout with org switcher
│   │   ├── page.tsx       # Dashboard home
│   │   └── team/          # Team management
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── theme/             # MUI theme config
│   └── ConvexClientProvider.tsx
├── convex/
│   ├── schema.ts          # Database schema (7 tables)
│   ├── lib/
│   │   └── auth.ts        # Permission helpers
│   ├── organizations.ts   # Org queries/mutations
│   └── auth.config.ts     # Clerk JWT config
├── middleware.ts          # Clerk auth middleware
└── .env.local            # Environment variables
```

## Database Schema

All tables include `organizationId` for multi-tenant isolation:

- **organizations** - Company data synced from Clerk
- **equipment** - Equipment/vehicles with costs
- **employees** - Team members with burden multipliers
- **loadouts** - Service configurations
- **customers** - Client management
- **projects** - Job tracking
- **proposals** - Quote generation

## Permission System

Use built-in helpers in `convex/lib/auth.ts`:

```typescript
import { requireAdmin, requireOwner, getOrganization } from "./lib/auth";

export const create = mutation({
  handler: async (ctx, args) => {
    // Only admins can create
    await requireAdmin(ctx);

    // Get current organization
    const org = await getOrganization(ctx);

    // Insert with organization isolation
    return await ctx.db.insert("equipment", {
      organizationId: org._id,
      ...args,
    });
  },
});
```

## Role Permissions

| Role | Access Level |
|------|-------------|
| Owner | Full control (billing, delete org) |
| Admin | Manage operations, team, data |
| Member | Read-only, assigned work |

## Customization

### Change Theme

Edit `app/theme/theme.ts`:
```typescript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#007AFF' }, // Change primary color
    background: { default: '#000000' }, // Change background
  },
});
```

### Add New Tables

1. Update `convex/schema.ts`
2. Add `organizationId` field
3. Create index: `by_organization`
4. Create queries/mutations with permission checks

### Modify Roles

Update `convex/lib/auth.ts` permission helpers to match your role structure.

## Deployment

See `SHIP-TO-PRODUCTION.md` for complete deployment checklist.

**Quick steps:**
1. Deploy Convex: `npx convex deploy`
2. Update environment variables to production
3. Configure Clerk production paths
4. Deploy Next.js to Vercel

## Documentation

- `CLERK_ORGANIZATIONS_SETUP.md` - Detailed Clerk setup
- `MULTI_TENANCY_SETUP_COMPLETE.md` - Architecture overview
- `SHIP-TO-PRODUCTION.md` - Production deployment
- `CLERK_REDIRECT_FIX.md` - Troubleshooting redirects

## Tech Stack

- **Framework:** Next.js 16.0.1 (App Router, Turbopack)
- **Language:** TypeScript
- **Auth:** Clerk (Organizations + JWT)
- **Database:** Convex (Real-time, serverless)
- **UI:** Material-UI v7
- **Styling:** Emotion (CSS-in-JS)
- **Icons:** Material Icons

## License

Use this boilerplate for any project - commercial or personal.

## Support

For issues or questions:
- Check documentation files
- Review Clerk docs: https://clerk.com/docs
- Review Convex docs: https://docs.convex.dev

---

**Created:** 2025-11-11
**Status:** Production-ready multi-tenant boilerplate
**Use Case:** SaaS apps, team collaboration tools, multi-tenant platforms
