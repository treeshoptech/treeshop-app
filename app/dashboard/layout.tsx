"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
} from '@mui/material';
import Image from 'next/image';
import { BottomNav } from './BottomNav';

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
      <BottomNav />
    </>
  );
}
