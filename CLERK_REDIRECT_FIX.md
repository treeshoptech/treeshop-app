# Fix Clerk Redirect Issue

## Problem
After sign-in or accepting organization invitations, users are redirected to:
`https://frank-mammal-96.accounts.dev/default-redirect`

Instead of your app at `http://localhost:3000/dashboard`

## Root Cause
Clerk doesn't know where to redirect users after authentication. You need to configure the paths in Clerk Dashboard.

## Solution - Configure Clerk Paths

### Step 1: Set Home URL

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your TreeShop application
3. In the left sidebar, click **Paths**
4. Find **Home URL** section
5. Set to: `http://localhost:3000`
6. Click **Save**

### Step 2: Set Sign-in/Sign-up Redirect URLs

In the same **Paths** page:

1. Scroll to **After sign in**
2. Set to: `http://localhost:3000/dashboard`
3. Scroll to **After sign up**
4. Set to: `http://localhost:3000/dashboard`
5. Click **Save**

### Step 3: Add Allowed Redirect URLs

Still in **Paths** page:

1. Scroll to **Allowed redirect URLs**
2. Click **Add URL**
3. Add these URLs one by one:
   ```
   http://localhost:3000
   http://localhost:3000/dashboard
   http://localhost:3000/*
   ```
4. Click **Save**

### Step 4: Configure Organization Settings

1. In Clerk Dashboard, go to **Organizations** (left sidebar)
2. Scroll to **Organization profile settings**
3. Find **After leaving organization** redirect
4. Set to: `http://localhost:3000`
5. Click **Save**

### Alternative: Sign Out and Try Again

If you're already signed in to Clerk but stuck:

1. Go to: http://localhost:3000
2. You should see your landing page
3. Click "Get Started" to sign in through your app (not Clerk's dashboard)

The issue is you're accessing Clerk's hosted account page directly instead of going through your app's sign-in flow.

### Correct Flow:
1. Visit: **http://localhost:3000** (your app)
2. Click "Get Started" or "Sign In" button
3. Clerk modal appears
4. Sign in
5. Redirects to /dashboard ✅

### Wrong Flow (what you did):
1. Visited Clerk Dashboard directly
2. Signed in to Clerk account
3. Stuck on Clerk's page (can't redirect back) ❌
