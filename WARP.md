# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TreeShop is a professional tree service management application for managing leads, proposals, work orders, invoices, equipment, employees, and loadouts. Built with Next.js 16, Material-UI, Clerk authentication, and Convex real-time database.

**Key Technology Stack:**
- Next.js 16.0.1 (App Router)
- React 19.2.0
- TypeScript 5.9.3
- Clerk 6.35.0 (Authentication + Organizations)
- Convex 1.29.0 (Real-time backend)
- Material-UI 7.3.5 (UI components)
- Emotion (CSS-in-JS)

## Commands

### Development
```bash
# Start Next.js development server
npm run dev

# Start Convex development server (run in separate terminal)
npx convex dev

# Run both in parallel (if supported)
npm run dev & npx convex dev
```

### Building & Production
```bash
# Build for production
npm run build

# Start production server (after build)
npm run start

# Deploy Convex to production
npx convex deploy --prod

# Lint code
npm run lint
```

### Convex Backend
```bash
# Run Convex development server
npx convex dev

# Deploy to production
npx convex deploy --prod

# Import data from JSON export
npx convex import --table <table_name> <file.json>

# Export data
npx convex export

# View Convex logs
npx convex logs

# Run Convex function
npx convex run <function_name> --arg '{"key": "value"}'
```

### Environment Setup
```bash
# Required environment variables are in .env.local
# For production, see PRODUCTION_SETUP.md

# Development Convex URL is already configured
# Production requires: npx convex deploy --prod
```

## Architecture

### Multi-Tenant Structure

TreeShop uses **Clerk Organizations** for multi-tenancy. Every database table has an `organizationId` field that isolates data between companies.

**Authentication Flow:**
1. User authenticates with Clerk → JWT token issued
2. JWT contains `orgId` claim from active Clerk Organization
3. Convex backend extracts `orgId` from JWT (server-side)
4. All queries/mutations automatically filter by `organizationId`

**Never trust client-provided organization IDs.** Always extract from JWT using:
```typescript
import { getOrganization } from "./lib/auth";

// In Convex query/mutation
const org = await getOrganization(ctx);
// Returns organization record, throws if not found
```

### Project Structure

```
app/
├── (authenticated)/        # Protected routes with layout
│   ├── leads/             # Lead management
│   ├── proposals/         # Proposal creation/management  
│   ├── work-orders/       # Active work order tracking
│   ├── invoices/          # Invoicing
│   └── calculators/       # Pricing calculators (StumpScore, TreeShopScore)
├── dashboard/             # Main dashboard and settings
│   ├── customers/         # Customer management
│   ├── work-orders/       # Work order management & completion
│   ├── invoices/          # Invoice management
│   ├── settings/          # Organization settings, line items
│   └── tree-inventory/    # Tree inventory
├── components/            # Shared React components
├── hooks/                 # Custom React hooks
├── theme/                 # MUI theme (Apple-inspired dark theme)
├── sign-in/               # Clerk sign-in page
└── sign-up/               # Clerk sign-up page

convex/
├── schema.ts              # Database schema (ALL TABLES)
├── lib/
│   ├── auth.ts            # Auth helpers (getOrganization, requireManager, etc.)
│   └── employeeHelpers.ts # Employee utility functions
├── organizations.ts       # Organization queries/mutations
├── customers.ts           # Customer CRUD
├── projects.ts            # Project/Lead management
├── proposals.ts           # Proposal generation
├── workOrders.ts          # Work order lifecycle
├── lineItems.ts           # Line item operations
├── lineItemTemplates.ts   # Reusable line item templates
├── invoices.ts            # Invoice generation
├── employees.ts           # Employee management
├── equipment.ts           # Equipment tracking
├── loadouts.ts            # Loadout configuration (crew + equipment combos)
├── analytics.ts           # ML/Analytics data collection
├── dashboard.ts           # Dashboard KPIs
└── weatherAPI.ts          # Weather integration (NWS API)
```

### Key Architectural Patterns

**1. Server Components by Default**
- All page components are Server Components unless marked with `"use client"`
- Use Server Components for data fetching when possible
- Only use Client Components for interactivity (forms, onClick, etc.)

**2. Convex Real-Time Database**
- All data is in Convex, not a traditional SQL database
- Queries are reactive - UI updates automatically when data changes
- Use `useQuery()` hook for reading data in client components
- Use `useMutation()` hook for writing data
- Server components use `await fetchQuery()` or `await fetchMutation()`

**3. Route Groups**
- `(authenticated)/` - Routes that require auth + share a layout
- `dashboard/` - Main dashboard routes (also authenticated)
- Sign-in/sign-up are public routes handled by Clerk

**4. Protected Routes**
Middleware in `middleware.ts` uses Clerk's `clerkMiddleware()`. Protected routes are defined via Clerk's route matchers.

**5. Design System**
Apple-inspired dark theme with:
- Pure black background (#000000)
- Apple Blue primary (#007AFF)
- Dark gray cards (#1C1C1E)
- Consistent spacing and typography

## Database Schema Overview

All tables in `convex/schema.ts` are multi-tenant with `organizationId`.

**Core Tables:**
- `organizations` - Company records (synced from Clerk)
- `customers` - Customer/client records
- `employees` - Crew members with career tracks and compensation
- `equipment` - Equipment with ownership/operating costs
- `loadouts` - Service configurations (equipment + crew combos with production rates)

**Job Lifecycle Tables:**
- `projects` - Tracks jobs from lead → proposal → work order → invoice
- `proposals` - Customer quotes with line items
- `workOrders` - Active jobs with time tracking and completion data
- `lineItems` - Atomic units of work (tied to proposals/work orders/invoices)
- `invoices` - Final billing documents
- `timeEntries` - Employee time tracking per work order

**Configuration Tables:**
- `lineItemTemplates` - Reusable line items library
- `organizationSettings` - Terms, conditions, document templates
- `activityTypes` - Trackable activities (production, transport, support)

**ML & Analytics Tables:**
- `jobPerformanceMetrics` - Actual vs estimated tracking for ML
- `equipmentUtilizationLogs` - Equipment usage per job
- `employeeProductivityLogs` - Employee performance tracking
- `weatherDataLogs` - Historical weather data
- `customerBehaviorLogs` - Customer interaction patterns
- `mlTrainingData` - Preprocessed features for ML
- `mlPredictions` - Model predictions storage
- `mlModelPerformance` - Model accuracy tracking

## Important Development Notes

### Authentication & Permissions

**Convex Permission Helpers** (in `convex/lib/auth.ts`):
```typescript
// Get current organization (required for all queries/mutations)
const org = await getOrganization(ctx);

// Require specific role (throws if insufficient permissions)
await requireManager(ctx);  // Manager or above
await requireAdmin(ctx);    // Admin or Owner only

// Check specific permission
await requirePermission(ctx, "org:equipment:manage");
```

**Clerk Roles:**
- `org:owner` - Organization creator (full control)
- `org:admin` - Elevated permissions
- `org:member` - Basic access

### Convex Best Practices

1. **Always use `getOrganization(ctx)` first** in all queries/mutations
2. **Filter all queries by `organizationId`** - never trust client input
3. **Index by organization** - use `.withIndex("by_organization", ...)`
4. **Handle missing auth gracefully** - auth helpers throw descriptive errors
5. **Use transactions** when creating related records (e.g., project + proposal + line items)

### Work Order Lifecycle

Work orders can be created two ways:
1. **From Proposal** - `creationType: "PROPOSAL"` - inherits all proposal data
2. **Direct Entry** - `creationType: "DIRECT"` - manual entry without proposal

**Completion Flow:**
When completing a work order (`/dashboard/work-orders/[id]/complete`):
- 6-step wizard collects actual vs estimated data
- Triggers creation of:
  - `jobPerformanceMetrics` record
  - `equipmentUtilizationLogs` for each equipment
  - `employeeProductivityLogs` for each crew member
  - `weatherDataLog`
- Updates project status to "Invoice"
- Calculates accuracy scores for ML training

### TypeScript Configuration

- Target: ES2017
- Strict mode: enabled
- Path alias `@/*` maps to project root
- Use `@/convex/_generated/api` for Convex API imports

**Note:** `ignoreBuildErrors: true` is set in `next.config.ts` due to calculator pages - fix those type errors when working on calculators.

### Styling

- Use MUI's `sx` prop for component styling
- Theme colors accessible via `theme.palette.*`
- Avoid inline styles - use `sx` or styled components
- Grid system uses `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` (MUI v7 syntax)

### ML Infrastructure

TreeShop has extensive data collection for machine learning:
- **Job Performance Metrics** - Tracks actual vs estimated for continuous improvement
- **Equipment Utilization** - Logs equipment productivity and costs
- **Employee Productivity** - Tracks individual and crew performance
- **Weather Correlation** - Logs weather conditions for ML features
- **Customer Behavior** - Tracks engagement and decision patterns

See `ML_INFRASTRUCTURE_GUIDE.md` for complete details.

## Testing

No formal test suite currently exists. When adding tests:
- Create `__tests__` directories alongside code
- Use Jest + React Testing Library
- Test Convex functions by importing and calling directly

## Deployment

**Development:**
- Next.js dev server: `npm run dev`
- Convex dev server: `npx convex dev` (separate terminal)

**Production:**
1. Deploy Convex: `npx convex deploy --prod`
2. Set Convex env var: `CLERK_JWT_ISSUER_DOMAIN=https://clerk.treeshopterminal.com`
3. Set Vercel env vars (see `PRODUCTION_SETUP.md`)
4. Deploy to Vercel (automatic on push to main)

Domain: https://treeshopterminal.com

## Common Tasks

### Adding a New Feature Page

1. Create page file: `app/dashboard/feature-name/page.tsx`
2. Create Convex functions: `convex/featureName.ts`
3. Add schema tables to `convex/schema.ts` if needed
4. Add navigation link in appropriate layout
5. Ensure all queries filter by `organizationId`

### Creating a New Convex Query

```typescript
import { query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);
    
    return await ctx.db
      .query("tableName")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});
```

### Creating a New Convex Mutation

```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrganization, requireManager } from "./lib/auth";

export const create = mutation({
  args: {
    name: v.string(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    await requireManager(ctx); // Check permissions
    const org = await getOrganization(ctx);
    
    return await ctx.db.insert("tableName", {
      organizationId: org._id,
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

### Using Convex in Client Components

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const items = useQuery(api.moduleName.list);
  const createItem = useMutation(api.moduleName.create);
  
  if (!items) return <div>Loading...</div>;
  
  return (
    <div>
      {items.map((item) => (
        <div key={item._id}>{item.name}</div>
      ))}
      <button onClick={() => createItem({ name: "New Item" })}>
        Add Item
      </button>
    </div>
  );
}
```

## Known Issues & TODOs

- TypeScript errors in calculator pages (ignored in build)
- Consider adding formal test suite
- ML prediction features are infrastructure-ready but not yet actively training models
- Weather API integration uses National Weather Service (free, US only)

## Additional Documentation

- `README.md` - Project overview and setup
- `SETUP_GUIDE.md` - Detailed local setup instructions
- `PRODUCTION_SETUP.md` - Production deployment guide
- `MULTI_TENANCY_SETUP_COMPLETE.md` - Multi-tenancy architecture details
- `ML_INFRASTRUCTURE_GUIDE.md` - ML data collection and features
- `CLERK_ORGANIZATIONS_SETUP.md` - Clerk Organizations configuration
- Various `*_STATUS.md` files document feature implementation status
