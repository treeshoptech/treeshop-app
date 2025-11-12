import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Construction as ConstructionIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Top App Bar - Compact for mobile */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo */}
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <Image
              src="/images/logo.png"
              alt="TreeShop"
              width={80}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {/* Organization Switcher - Centered */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: {
                    display: "flex",
                    alignItems: "center",
                  },
                  organizationSwitcherTrigger: {
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #2C2C2E",
                    backgroundColor: "#1C1C1E",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    "&:hover": {
                      borderColor: "#007AFF",
                    },
                  },
                },
              }}
            />
          </Box>

          {/* User Button - Right aligned */}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: "32px",
                  height: "32px",
                },
              },
            }}
          />
        </Toolbar>
      </AppBar>

      {/* Main Content - Bottom padding for navigation */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 2,
          mb: 10, // Space for bottom nav
          px: { xs: 2, sm: 3 }
        }}
      >
        {children}
      </Container>

      {/* Bottom Navigation - Mobile First, Right Thumb Optimized */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          sx={{
            backgroundColor: '#1C1C1E',
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              color: '#8E8E93',
              minWidth: 'auto',
              padding: '6px 12px',
              '&.Mui-selected': {
                color: '#007AFF',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '11px',
              '&.Mui-selected': {
                fontSize: '12px',
                fontWeight: 600,
              },
            },
          }}
        >
          <BottomNavigationAction
            label="Dashboard"
            icon={<DashboardIcon />}
            component={Link}
            href="/dashboard"
          />
          <BottomNavigationAction
            label="Equipment"
            icon={<ConstructionIcon />}
            component={Link}
            href="/dashboard/equipment"
          />
          <BottomNavigationAction
            label="Customers"
            icon={<PeopleIcon />}
            component={Link}
            href="/dashboard/customers"
          />
          <BottomNavigationAction
            label="Projects"
            icon={<DescriptionIcon />}
            component={Link}
            href="/dashboard/projects"
          />
        </BottomNavigation>
      </Paper>
    </>
  );
}
