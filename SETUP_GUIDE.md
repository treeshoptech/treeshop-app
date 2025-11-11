# TreeShop Setup Guide

This guide will help you get the TreeShop application running on your local machine.

## Quick Start (5 minutes)

### Step 1: Prerequisites

Make sure you have:
- ✅ Node.js 18 or higher installed ([Download](https://nodejs.org/))
- ✅ npm (comes with Node.js)
- ✅ A code editor (VS Code recommended)

### Step 2: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages (~153 packages, takes about 30 seconds).

### Step 3: Configure Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up or log in
3. Create a new application or select existing one
4. Go to "API Keys" section
5. Copy your keys:
   - `Publishable Key` (starts with `pk_test_` or `pk_live_`)
   - `Secret Key` (starts with `sk_test_` or `sk_live_`)

### Step 4: Set Up Environment Variables

The project already has a `.env.local` file with your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnJhbmstbWFtbWFsLTk2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_pRBP8BBxSFKLEMjDI2A20XBiYr7nyoGav0Wy34JazJ
CONVEX_URL=https://fine-ibis-640.convex.cloud
```

✅ These keys are already configured and ready to use!

### Step 5: Start the Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 16.0.1 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.1.130:3000

✓ Ready in 2.8s
```

### Step 6: Open the Application

Open your browser and go to: [http://localhost:3000](http://localhost:3000)

🎉 **You're done!** The application should be running.

## What You'll See

### Home Page (/)

When you first open the app:

1. **Navigation Bar**:
   - TreeShop logo on the left
   - "Sign In" and "Sign Up" buttons on the right (when logged out)
   - User profile button on the right (when logged in)

2. **Hero Section**:
   - Large heading: "Professional Tree Service"
   - Description of the platform
   - "Get Started" button (when logged out)
   - "Go to Dashboard" button (when logged in)

3. **Feature Cards**:
   - Scientific Pricing
   - Multiple Services
   - Project Management
   - Analytics & Reports

4. **Call to Action**:
   - Final section encouraging sign-up

### Testing Authentication

1. Click the "Sign Up" button
2. Clerk will show a modal with sign-up options
3. Enter your email and create a password
4. Verify your email
5. You'll be redirected and see your profile button
6. Click "Go to Dashboard" to see the protected dashboard page

### Dashboard Page (/dashboard)

After signing in:

1. **KPI Cards** showing:
   - Total Revenue: $0
   - Active Projects: 0
   - Customers: 0
   - Profit Margin: 0%

2. **Quick Actions**:
   - New Project
   - Manage Customers
   - View Analytics

## Troubleshooting

### Port 3000 Already in Use

If you see an error that port 3000 is already in use:

```bash
# Find the process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found Errors

If you see module import errors:

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Clerk Authentication Not Working

1. Check your `.env.local` file exists
2. Verify your Clerk keys are correct
3. Make sure you're using the correct Clerk application
4. Check Clerk dashboard for any application settings issues

### TypeScript Errors

The project is fully typed. If you see TypeScript errors:

```bash
# Check for type errors
npx tsc --noEmit

# They should auto-fix when you restart the dev server
npm run dev
```

## Development Workflow

### Making Changes

1. Edit any file in the `app/` directory
2. The page will automatically reload (Hot Module Replacement)
3. Changes appear instantly in your browser

### Adding a New Page

```bash
# Create a new directory in app/
mkdir app/my-page

# Create page.tsx
touch app/my-page/page.tsx
```

Then add your component:

```tsx
export default function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  );
}
```

Visit: [http://localhost:3000/my-page](http://localhost:3000/my-page)

### Protecting a Page

To make a page require authentication:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return <div>Protected content</div>;
}
```

## Next Steps

Now that your app is running:

1. ✅ Test the sign-up flow
2. ✅ Test the sign-in flow
3. ✅ Explore the dashboard
4. ✅ Check out the home page features
5. 🔨 Start building your tree service features!

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Dependencies
npm install          # Install all dependencies
npm install <pkg>    # Add a new package
npm update           # Update dependencies
```

## File Structure Reference

```
treeshop-app-clone/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard page (protected)
│   │   └── page.tsx
│   ├── theme/              # MUI theme
│   │   └── theme.ts
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── middleware.ts           # Clerk middleware
├── next.config.ts          # Next.js config
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
├── .env.local              # Environment variables
└── .gitignore              # Git ignore
```

## Key Technologies Used

- **Next.js 16.0.1**: React framework with App Router
- **Clerk 6.35.0**: Authentication platform
- **Material-UI 7.3.5**: React UI component library
- **TypeScript 5.9.3**: Type-safe JavaScript
- **Emotion**: CSS-in-JS styling

## Getting Help

If you run into issues:

1. Check this guide first
2. Read the [README.md](README.md) for detailed information
3. Check Clerk documentation: [https://clerk.com/docs](https://clerk.com/docs)
4. Check Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
5. Check MUI documentation: [https://mui.com](https://mui.com)

## Production Deployment

When you're ready to deploy:

1. Push your code to GitHub
2. Connect to Vercel (recommended) or your hosting platform
3. Add environment variables in the hosting dashboard
4. Deploy!

Your app will be live at your chosen domain.

---

**Happy Coding! 🌲**
