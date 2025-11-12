# Clerk JWT Template Setup for Convex

## Problem
Convex backend needs organization context from Clerk, but the JWT token doesn't include `org_id` claim by default.

## Solution
Configure a custom JWT template in Clerk Dashboard.

## Steps

### 1. Go to Clerk Dashboard
- Navigate to: https://dashboard.clerk.com
- Select your application: "frank-mammal-96" (or your current app)

### 2. Create JWT Template
- Go to **JWT Templates** in the sidebar
- Click **New template**
- Template name: `convex`
- **IMPORTANT**: The template name MUST be exactly `convex` to match the `applicationID` in `convex/auth.config.ts`

### 3. Add Claims
In the Claims section, add the following JSON:

```json
{
  "org_id": "{{org.id}}",
  "org_role": "{{org.role}}",
  "org_slug": "{{org.slug}}"
}
```

### 4. Token Settings
- **Lifetime**: 3600 seconds (1 hour) - default is fine
- **Allowed Clock Skew**: 5 seconds - default is fine

### 5. Save Template
Click **Save** to activate the template.

### 6. Verify Configuration
After saving:
1. Sign out of your app
2. Sign back in
3. The JWT token will now include organization claims
4. Convex queries will work with organization context

## What This Does

The JWT template adds these claims to every authentication token:
- `org_id`: Clerk's organization ID (e.g., "org_2abc123...")
- `org_role`: User's role in the organization (e.g., "org:admin", "org:member")
- `org_slug`: Organization slug for readable URLs

These claims are read by `convex/lib/auth.ts` to:
1. Identify which organization the user belongs to
2. Filter all database queries by organization (multi-tenancy)
3. Enforce role-based permissions

## Current Configuration

Your Clerk JWT Issuer Domain: `https://frank-mammal-96.clerk.accounts.dev`

This is configured in:
- `.env.local` as `CLERK_JWT_ISSUER_DOMAIN`
- `convex/auth.config.ts` as the auth provider

## Troubleshooting

If you still get "No organization context" errors:

1. **Clear browser cache and cookies**
2. **Sign out completely** from the app
3. **Sign back in** to get a fresh token
4. **Check Convex logs** - you should see console logs showing the available claims
5. **Verify you're in an organization** - use the Organization Switcher to select/create one

## Debug Mode

The file `convex/lib/auth.ts` currently has debug logging enabled. Check your Convex dev server output to see:
- `Available identity claims:` - Lists all claim names in the token
- `Full identity:` - Shows all values

Once JWT template is working, you can remove the console.log statements.
