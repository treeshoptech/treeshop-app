# TreeShop - Professional Tree Service Management

A modern web application for tree service professionals built with Next.js, Clerk authentication, and Material-UI.

## Features

- **Clerk Authentication**: Secure user authentication with sign-in, sign-up, and user management
- **Material-UI Design System**: Beautiful, Apple-inspired dark theme interface
- **Next.js App Router**: Modern React framework with server-side rendering
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Authentication**: Clerk
- **UI Library**: Material-UI (MUI) v7
- **Language**: TypeScript
- **Styling**: Emotion (CSS-in-JS)
- **Icons**: Material-UI Icons

## Design Theme

The application features a professional Apple-inspired dark theme:

- **Background**: Pure black (#000000)
- **Primary Color**: Apple Blue (#007AFF)
- **Text**: White (#FFFFFF) for headings
- **Secondary Text**: iOS gray (#8E8E93)
- **Cards**: Dark gray (#1C1C1E) with subtle borders (#2C2C2E)
- **Design Features**:
  - Clean, minimalist Apple-style design
  - All action cards use Apple blue (#007AFF) for icons
  - Hover effects with blue borders
  - Consistent spacing and typography
  - Professional, modern look

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd treeshop-app-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CONVEX_URL=your_convex_url
```

Get your Clerk keys from: https://dashboard.clerk.com/

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
treeshop-app-clone/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page (protected)
│   ├── theme/
│   │   └── theme.ts           # MUI theme configuration
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Home page
├── middleware.ts              # Clerk authentication middleware
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── .env.local                 # Environment variables (not tracked)
└── .gitignore                 # Git ignore rules
```

## Authentication Flow

The application uses Clerk for authentication with the following setup:

1. **Middleware**: `middleware.ts` uses `clerkMiddleware()` to protect routes
2. **Layout**: `app/layout.tsx` wraps the app with `<ClerkProvider>`
3. **Components**: Uses Clerk's React components:
   - `<SignInButton>` - Triggers sign-in modal
   - `<SignUpButton>` - Triggers sign-up modal
   - `<UserButton>` - User profile dropdown
   - `<SignedIn>` - Shows content only to signed-in users
   - `<SignedOut>` - Shows content only to signed-out users

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Pages

### Home Page (`/`)

- Landing page with hero section
- Feature cards showcasing TreeShop capabilities
- Call-to-action buttons for sign-up
- Shows sign-in/sign-up buttons when logged out
- Shows "Go to Dashboard" button when logged in

### Dashboard (`/dashboard`)

- Protected route (requires authentication)
- KPI cards showing business metrics
- Quick action cards for common tasks
- User profile button in navigation

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to set the environment variables in your deployment platform.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CONVEX_URL` | Convex backend URL | Optional |

## Security

- All environment variables with sensitive data are stored in `.env.local`
- `.env.local` is excluded from git via `.gitignore`
- Clerk handles all authentication securely
- Middleware protects routes automatically

## Customization

### Theme

To customize the theme, edit `app/theme/theme.ts`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // Change primary color
    },
    // ... other theme options
  },
});
```

### Adding New Pages

1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. The file will automatically become a route

Example:
```
app/
└── projects/
    └── page.tsx  # Accessible at /projects
```

## Contributing

This is a private project for TreeShop. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

Private and proprietary. All rights reserved.

## Support

For support, contact the TreeShop development team.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Clerk](https://clerk.com/)
- UI components from [Material-UI](https://mui.com/)
- Icons from [Material-UI Icons](https://mui.com/material-ui/material-icons/)
